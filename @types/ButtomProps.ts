export default interface ButtomProps {
  value: string,
  onPress: any,
  loading?: boolean,
  disabled?: boolean,
  style?: any,
  textStyle?: any,
  variant?: 'primary' | 'secondary' | 'cancel' | 'save',
  size?: 'small' | 'medium' | 'large',
  fullWidth?: boolean
}