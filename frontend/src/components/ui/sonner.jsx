import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    (<Sonner
      theme={theme}
      position="top-right"
      duration={2500}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-lg group-[.toaster]:border-0 group-[.toaster]:bg-gray-200 group-[.toaster]:px-4 group-[.toaster]:py-3 group-[.toaster]:font-sans group-[.toaster]:text-[15px] group-[.toaster]:font-semibold group-[.toaster]:leading-5 group-[.toaster]:text-gray-950 group-[.toaster]:shadow-md",
          title: "font-sans text-[15px] font-semibold leading-5 text-gray-950",
          description: "font-sans text-sm font-normal text-gray-700",
          actionButton:
            "group-[.toast]:bg-slate-900 group-[.toast]:text-slate-50",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500",
        },
      }}
      {...props} />)
  );
}

export { Toaster }
