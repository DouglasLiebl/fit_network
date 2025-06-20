import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { Alert } from "./alertUtils";
import * as ImagePicker from 'expo-image-picker';

export default class CameraUtils {
    public static takePicture = async (
        setImage: (url: string) => void,
        isEditing: boolean = false,
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
                
                if (!isEditing) {
                    this.uploadImage(imageUri, setImage);
                }
            }
        } catch (error) {
            Alert.error('Erro', 'Não foi possível acessar a câmera');
        }
    };
    
    public static pickImage = async (
        setImage: (url: string) => void,
        isEditing: boolean = false,
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
                
                if (!isEditing) {
                    this.uploadImage(imageUri, setImage);
                }
            }
        } catch (error) {
            Alert.error('Erro', 'Não foi possível acessar a galeria');
        }
    };
    
    public static uploadImage = async (
        uri: string,
        setImage: (url: string) => void,
    ): Promise<string | null> => {
        if (!uri) return null;
    
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            
            const storage = getStorage();
            const filename = `posts/${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const imageRef = ref(storage, filename);
            
            await uploadBytes(imageRef, blob);
            const downloadUrl = await getDownloadURL(imageRef);
            
            setImage(downloadUrl);
            return downloadUrl;
        } catch (error: any) {
            Alert.error('Erro', 'Falha ao fazer upload da imagem: ' + error.message);
            return null;
        }
    };
}