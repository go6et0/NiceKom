"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/site/locale-provider";

export default function DeleteOrderButton({
  action,
  className,
}: {
  action: (formData: FormData) => void;
  className?: string;
}) {
  const { t } = useLocale();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className={className}>
          {t.admin.delete}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.admin.deleteOrderTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.admin.deleteOrderDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.admin.cancel}</AlertDialogCancel>
          <form action={action}>
            <AlertDialogAction asChild>
              <Button variant="destructive" size="sm" type="submit">
                {t.admin.delete}
              </Button>
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
