import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { Alert } from "./alertUtils";
import * as ImagePicker from 'expo-image-picker';

export default class CameraUtils {
    public static takePicture = async (
        setImage: (url: string) => void,
        imageType: string = 'posts',
        upload: boolean = false,
    ) => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    
        if (cameraPermission.status !== ImagePicker.PermissionStatus.GRANTED) {
            Alert.error('Permissão necessária', 'Precisamos de permissão para acessar sua câmera');
            return;
        }
    
        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });
    
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                setImage(imageUri);
                
                if (upload) {
                    this.uploadImage(imageUri, setImage, imageType);
                }
            }
        } catch (error) {
            Alert.error('Erro', 'Não foi possível acessar a câmera');
        }
    };
    
    public static pickImage = async (
        setImage: (url: string) => void,
        imageType: string = 'posts',
        upload: boolean = false,
    ) => {
        const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
        if (galleryPermission.status !== ImagePicker.PermissionStatus.GRANTED) {
            Alert.error('Permissão necessária', 'Precisamos de permissão para acessar sua galeria');
            return;
        }
    
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });
    
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                setImage(imageUri);
                
                if (upload) {
                    this.uploadImage(imageUri, setImage, imageType);
                }
            }
        } catch (error) {
            Alert.error('Erro', 'Não foi possível acessar a galeria');
        }
    };
    
    public static uploadImage = async (
        uri: string,
        setImage: (url: string) => void,
        imageType: string = 'posts',
    ): Promise<string | null> => {
        if (!uri) return null;
    
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            
            const folderName = imageType === 'profiles' ? 'pfp' : 
                               imageType === 'pfp' ? 'pfp' : 'posts';
            
            const storage = getStorage();
            const filename = `${folderName}/${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const imageRef = ref(storage, filename);
            
            await uploadBytes(imageRef, blob);
            const downloadUrl = await getDownloadURL(imageRef);
            
            setImage(downloadUrl);
            return downloadUrl;
        } catch (error: any) {
            console.error("Upload error:", error);
            
            try {
                if (error.message && (error.message.includes('permission') || error.message.includes('unauthorized'))) {
                    console.log("Trying fallback upload method...");
                    
                    const response = await fetch(uri);
                    const newBlob = await response.blob();
                    
                    const storage = getStorage();
                    

                    const explicitFolderName = imageType === 'profiles' || imageType === 'pfp' ? 'pfp' : 'posts';
                    const filename = `${explicitFolderName}/${Date.now()}_${Math.random().toString(36).substring(7)}`;
                    
                    console.log(`Attempting upload to: ${filename}`);
                    const imageRef = ref(storage, filename);
                    
                    await uploadBytes(imageRef, newBlob);
                    const downloadUrl = await getDownloadURL(imageRef);
                    
                    setImage(downloadUrl);
                    return downloadUrl;
                }
            } catch (fallbackError: any) {
                console.error("Fallback upload failed:", fallbackError);
            }
            Alert.error('Erro', `Falha ao fazer upload da imagem: ${error.message}`);
            return null;
        }
    };
}