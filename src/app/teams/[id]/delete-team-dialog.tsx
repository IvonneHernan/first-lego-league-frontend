"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TeamsService } from "@/api/teamApi";
import { Button } from "@/app/components/button";
import ErrorAlert from "@/app/components/error-alert";
import { clientAuthProvider } from "@/lib/authProvider";
import { parseErrorMessage } from "@/types/errors";

interface DeleteTeamDialogProps {
  readonly teamId: string;
  readonly teamName: string;
  readonly onCancel: () => void;
}

export default function DeleteTeamDialog({
  teamId,
  teamName,
  onCancel,
}: DeleteTeamDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const service = new TeamsService(clientAuthProvider);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleCancel(event: Event) {
      event.preventDefault();
      if (!isDeleting) onCancel();
    }

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [isDeleting, onCancel]);

  async function handleDelete() {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await service.deleteTeam(teamId);
      router.push("/teams");
      router.refresh();
    } catch (error) {
      setErrorMessage(parseErrorMessage(error));
      setIsDeleting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-busy={isDeleting}
      className="m-auto w-full max-w-md border border-border bg-card px-6 py-6 shadow-lg backdrop:bg-black/50 sm:px-8 sm:py-8"
    >
      <h2
        id={titleId}
        className="text-lg font-semibold tracking-[-0.03em] text-foreground"
      >
        Delete team
      </h2>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-foreground">{teamName}</span>? This
        action cannot be undone.
      </p>

      {errorMessage && (
        <div className="mt-4">
          <ErrorAlert message={errorMessage} />
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          autoFocus
          type="button"
          variant="outline"
          disabled={isDeleting}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="destructive"
          disabled={isDeleting}
          onClick={handleDelete}
        >
          {isDeleting ? "Deleting..." : "Delete team"}
        </Button>
      </div>
    </dialog>
  );
}
