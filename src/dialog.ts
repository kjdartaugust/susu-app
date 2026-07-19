import { Alert, Platform } from "react-native";

// react-native-web does not implement Alert, so every Alert.alert call is a
// silent no-op in the browser: sign out did nothing, destructive actions had
// no confirmation, and error messages never appeared. These helpers use the
// browser's own dialogs on web and the native Alert on iOS/Android.

const isWeb = Platform.OS === "web";

/** Tell the user something. */
export function notify(title: string, message?: string) {
  if (isWeb) {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

/** Ask before doing something destructive; runs onConfirm only on yes. */
export function confirm({
  title,
  message,
  confirmLabel = "OK",
  destructive = false,
  onConfirm,
}: {
  title: string;
  message?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  if (isWeb) {
    if (window.confirm(message ? `${title}\n\n${message}` : title)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    {
      text: confirmLabel,
      style: destructive ? "destructive" : "default",
      onPress: onConfirm,
    },
  ]);
}
