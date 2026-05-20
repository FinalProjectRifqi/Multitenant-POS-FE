import type { StatItem } from "@/components/shared/stats-grid";
import type { UserEntity } from "@/lib/types/user";

export function buildUserStats(users: UserEntity[]): StatItem[] {
  const activeCount = users.filter((user) => user.status).length;
  const inactiveCount = users.length - activeCount;

  return [
    {
      label: "Total Pengguna",
      value: users.length,
      description: "Pengguna yang tampil pada halaman ini",
    },
    {
      label: "Aktif",
      value: activeCount,
      description: "Akun dengan status aktif",
    },
    {
      label: "Tidak Aktif",
      value: inactiveCount,
      description: "Akun dengan status nonaktif",
    },
  ];
}
