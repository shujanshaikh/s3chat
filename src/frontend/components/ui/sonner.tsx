import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"


const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "dark" } = useTheme()
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-left"
      toastOptions={{
        style: {
          background: 'rgba(30, 27, 75, 0.9)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: 'rgb(224, 231, 255)',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.1)',
        },
        className: 'sonner-toast',
      }}
      style={
        {
          "--normal-bg": "rgba(30, 27, 75, 0.9)",
          "--normal-text": "rgb(224, 231, 255)",
          "--normal-border": "rgba(99, 102, 241, 0.3)",
          "--success-bg": "rgba(34, 197, 94, 0.2)",
          "--success-border": "rgba(34, 197, 94, 0.4)",
          "--success-text": "rgb(34, 197, 94)",
          "--error-bg": "rgba(239, 68, 68, 0.2)",
          "--error-border": "rgba(239, 68, 68, 0.4)",
          "--error-text": "rgb(239, 68, 68)",
          "--warning-bg": "rgba(245, 158, 11, 0.2)",
          "--warning-border": "rgba(245, 158, 11, 0.4)",
          "--warning-text": "rgb(245, 158, 11)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
