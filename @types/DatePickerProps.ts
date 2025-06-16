export default interface DatePickerProps {
  date: Date;
  onChange: (date: Date) => void;
  label?: string;
  labelStyle?: any;
  style?: any;
  format?: string;
  locale?: any;
  disabled?: boolean;
}