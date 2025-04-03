
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="bg-white text-gray-900 border border-gray-200">
            <div className="grid gap-1">
              {title && <ToastTitle className="text-gray-900 font-medium">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-gray-700">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-gray-500 hover:text-gray-900" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
