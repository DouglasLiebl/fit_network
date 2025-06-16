export default interface InputFieldProps {
  value: any,
  onChange: any,
  label: string,
  secure?: boolean,
  placeholder?: string,
  multiline?: boolean,
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'number-pad',
  style?: any,
  inputStyle?: any,
  labelStyle?: any,
  numberOfLines?: number,
  height?: number | string,
  disabled?: boolean
}