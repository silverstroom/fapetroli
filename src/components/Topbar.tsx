import { initials } from "@/lib/utils";

interface Props {
  title: string;
  userName: string;
}

export default function Topbar({ title, userName }: Props) {
  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-right">
        <div className="topbar-user">
          <div className="topbar-avatar">{initials(userName)}</div>
          <span className="topbar-uname">{userName}</span>
        </div>
      </div>
    </div>
  );
}
