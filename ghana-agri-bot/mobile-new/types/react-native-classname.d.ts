// add runtime typing so JSX className (e.g. nativewind/tailwind) doesn't error in TS
declare module 'react-native' {
  import * as RN from 'react-native';
  // extend common props used with className utilities (nativewind, tailwind-rn, etc.)
  interface ViewProps extends RN.ViewProps {
    className?: string;
  }
  interface TextProps extends RN.TextProps {
    className?: string;
  }
  interface TouchableOpacityProps extends RN.TouchableOpacityProps {
    className?: string;
  }
  interface TextInputProps extends RN.TextInputProps {
    className?: string;
  }
  interface ScrollViewProps extends RN.ScrollViewProps {
    className?: string;
  }
}