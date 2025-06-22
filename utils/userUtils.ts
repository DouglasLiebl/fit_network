import { User, updateProfile, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { 
  doc, 
  getDoc, 
  getFirestore, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  QueryDocumentSnapshot,
  deleteField,
  writeBatch
} from "firebase/firestore";
import { auth } from "@/context/firebase";
import { CacheUtils } from "./cacheUtils";
import { forceNullPhotoURL } from "./authOverride";

export const UserUtils = {

  async ensureUserProfile(): Promise<User | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    
    const db = getFirestore();
    
    try {
      if (!currentUser.displayName) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        
        if (userDoc.exists() && userDoc.data().displayName) {
          await updateProfile(currentUser, {
            displayName: userDoc.data().displayName
          });
          
          return auth.currentUser;
        }
      } else {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        
        if (userDoc.exists() && (!userDoc.data().displayName || userDoc.data().displayName !== currentUser.displayName)) {
          await updateDoc(doc(db, "users", currentUser.uid), {
            displayName: currentUser.displayName
          });
        }
      }
      
      return currentUser;
    } catch (error) {
      console.error("Error ensuring user profile:", error);
      return currentUser;
    }
  },
  
  async updateProfilePhoto(photoURL: string | null): Promise<boolean> {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    
    const db = getFirestore();
    
    try {
      await CacheUtils.clearAllCache();
      
      await currentUser.reload();
      
      if (photoURL === null) {
        await updateDoc(doc(db, "users", currentUser.uid), { 
          photoURL: deleteField() 
        });

        await updateProfile(currentUser, { photoURL: null });
        
        await updateProfile(currentUser, { photoURL: "" });
        
        await forceNullPhotoURL();
        
        await currentUser.reload();

        await currentUser.getIdToken(true);
        if (currentUser.photoURL) {
          await updateProfile(currentUser, { photoURL: null });
          await new Promise(resolve => setTimeout(resolve, 500));
          await currentUser.reload();
        }
      } else {
        const photoURLWithCache = CacheUtils.getUncachedUrl(photoURL);
        
        await updateProfile(currentUser, { photoURL: photoURLWithCache });
        
        await updateDoc(doc(db, "users", currentUser.uid), { 
          photoURL: photoURLWithCache 
        });
      }
      
      try {
        const userPostsQuery = query(
          collection(db, "posts"),
          where("userId", "==", currentUser.uid)
        );
        
        const querySnapshot = await getDocs(userPostsQuery);
        
        const batch = writeBatch(db);
        let batchCount = 0;
        const MAX_BATCH_SIZE = 500;
        
        for (const postDoc of querySnapshot.docs) {
          if (photoURL === null) {
            batch.update(doc(db, "posts", postDoc.id), {
              userProfileImage: deleteField()
            });
          } else {
            batch.update(doc(db, "posts", postDoc.id), {
              userProfileImage: CacheUtils.getUncachedUrl(photoURL)
            });
          }
          
          batchCount++;
          
          if (batchCount >= MAX_BATCH_SIZE) {
            await batch.commit();
            batchCount = 0;
          }
        }
        
        if (batchCount > 0) {
          await batch.commit();
        }
        
      } catch (postUpdateError) {
        console.error("[POSTS UPDATE] Error updating user's posts with new profile photo:", postUpdateError);
      }
      
      await CacheUtils.clearAllCache();
      
      return true;
    } catch (error) {
      console.error("Error updating profile photo:", error);
      return false;
    }
  },

  getUserDisplayName(user: User | null): string {
    if (!user) return "Usuário";
    return user.displayName || "Usuário";
  },
  
  async updateUserProfile(
    data: {
      displayName?: string;
      email?: string;
      phoneNumber?: string;
      currentPassword?: string;
    }
  ): Promise<{
    success: boolean;
    error?: string;
    requiresReauth?: boolean;
  }> {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: "Usuário não encontrado" };
    
    const db = getFirestore();
    
    try {
      if (data.displayName) {
        await updateProfile(currentUser, { displayName: data.displayName });
      }
      
      if (data.email && data.email !== currentUser.email) {
        if (data.currentPassword) {
          try {
            const credential = EmailAuthProvider.credential(
              currentUser.email || '', 
              data.currentPassword
            );
            
            await reauthenticateWithCredential(currentUser, credential);
            await updateEmail(currentUser, data.email);
          } catch (emailError: any) {
            console.error("Error updating email:", emailError);
            
            if (emailError.code === 'auth/requires-recent-login') {
              return { 
                success: false, 
                error: "Para alterar seu email, é necessário fazer login novamente",
                requiresReauth: true 
              };
            }
            
            return { 
              success: false, 
              error: emailError.message || "Erro ao atualizar email"
            };
          }
        } else {
          console.log("Email change requested but no password provided for re-auth");
        }
      }
      
      const updateData: any = {};
      if (data.displayName) updateData.displayName = data.displayName;
      if (data.email) updateData.email = data.email;
      if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
      
      await updateDoc(doc(db, "users", currentUser.uid), updateData);
      
      if (data.displayName) {
        try {
          const userPostsQuery = query(
            collection(db, "posts"),
            where("userId", "==", currentUser.uid)
          );
          
          const querySnapshot = await getDocs(userPostsQuery);
          const updatePromises: Promise<any>[] = [];
          
          querySnapshot.forEach((postDoc: QueryDocumentSnapshot) => {
            updatePromises.push(
              updateDoc(doc(db, "posts", postDoc.id), {
                username: data.displayName
              })
            );
          });
          
          await Promise.all(updatePromises);
          
        } catch (postUpdateError) {
          console.error("Error updating user's posts with new display name:", postUpdateError);
        }
      }
      
      return { success: true };
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      return { 
        success: false, 
        error: error.message || "Erro ao atualizar perfil"
      };
    }
  }
};

export default UserUtils;
