import { getContactUsForAdmin } from "../contact-actions";
import { ContactUsForm } from "./ContactUsForm";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  const contact = await getContactUsForAdmin();
  return <ContactUsForm contact={contact} />;
}
