import { useCallback, useState, type ReactElement } from "react";
import { Snackbar } from "react-native-paper";
import { colors } from "../constants/theme";

export interface ToastController {
  show: (message: string) => void;
}

/** Feedback visual de ação (seção 4.1: feedback ≤ 300ms, nunca modal obstrutivo). */
export function useToast(): [ToastController, ReactElement] {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  const show = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
  }, []);

  const element = (
    <Snackbar
      visible={visible}
      onDismiss={() => setVisible(false)}
      duration={3000}
      style={{ backgroundColor: colors.textPrimary }}
    >
      {message}
    </Snackbar>
  );

  return [{ show }, element];
}
