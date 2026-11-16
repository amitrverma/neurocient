import ResetPasswordForm from "./ResetPasswordForm";
import AccountRecoveryShell from "@/app/components/AccountRecoveryShell";

export default function ResetPasswordPage() {
  return (
    <AccountRecoveryShell title="Choose a new password">
      <ResetPasswordForm />
    </AccountRecoveryShell>
  );
}
