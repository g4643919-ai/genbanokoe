import { getMasterData } from "@/lib/masterData";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { prefectures, fields, occupations, serviceTypes } = await getMasterData();

  return (
    <div className="container">
      <ProfileForm
        prefectures={prefectures}
        fields={fields}
        occupations={occupations}
        serviceTypes={serviceTypes}
      />
    </div>
  );
}
