import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { navigate } from "@/lib/router";
// import { useLocalSet } from "@/lib/hooks/use-local-set";
import { user } from "@/lib/user";
import {
  BarChart3,
  Bed,
  Calendar,
  ChevronRight,
  Clipboard,
  ClipboardList,
  Clock,
  Database,
  DollarSign,
  HeartPulse,
  Hospital,
  LayoutDashboard,
  Package2,
  Pill,
  PillBottleIcon,
  PillIcon,
  Receipt,
  ReceiptText,
  Stethoscope,
  UserCog,
  Users,
  Users2Icon,
  UsersRound,
  Wallet,
  Wallet2Icon,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

// Types remain the same
type SubItemWithChildren = {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: SubMenuItem[];
};

type SubItem = SubMenuItem | SubItemWithChildren;

type MenuItem = {
  title: string;
  url: string;
  role: string[];
  icon?: React.ComponentType<{ className?: string }>;
  items?: SubItem[];
};

const items: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard/",
    role: ["Admin", "Dokter"],
    icon: LayoutDashboard,
  },
  {
    title: "Rawat Jalan",
    url: "#",
    role: ["Admin", "Dokter"],
    icon: Stethoscope,
    items: [
      {
        title: "Antrean Hari Ini",
        icon: UsersRound,
        url: "/queue/display",
      },
      {
        title: "Riwayat Antrean Poli",
        icon: Clock,
        url: "/queue/history",
      },
      {
        title: "Booking",
        icon: Calendar,
        url: "/queue/booking",
      },
    ],
  },
  {
    title: "Manajemen Pasien",
    url: "#",
    role: ["Admin", "Dokter"],
    icon: Users,
    items: [
      {
        title: "Pasien Terdaftar",
        url: "/patient",
        icon: ClipboardList,
      },
      {
        title: "Kelola Rekam Medis Pasien",
        url: "/patient/medical-record",
        icon: HeartPulse,
      },
    ],
  },
  {
    title: "Manajemen Staff",
    url: "#",
    role: ["Admin"],
    icon: UserCog,
    items: [
      {
        title: "Dokter",
        url: "/staff/doctor",
        icon: Stethoscope,
      },
      {
        title: "Staff",
        url: "/staff/other",
        icon: Users2Icon,
      },
      // {
      //   title: "Role",
      //   url: "/role-and-user/manage-role",
      //   icon: UserCog2,
      // },
    ],
  },
  {
    title: "Manajemen Obat",
    url: "#",
    role: ["Admin"],
    icon: PillIcon,
    items: [
      {
        title: "Pesan Obat",
        url: "/medicine/order/list",
        icon: PillIcon,
      },
      {
        title: "Antrean Obat",
        url: "/medicine/queue/list",
        icon: PillBottleIcon,
      },
      // {
      //   title: "Riwayat Antrean Obat",
      //   url: "/admin/medicine/queue/history",
      //   icon: HistoryIcon,
      // },
    ],
  },
  {
    title: "Pembayaran",
    url: "#",
    role: ["Admin"],
    icon: Wallet2Icon,
    items: [
      {
        title: "Menunggu Pembayaran",
        url: "/payment/wait/list",
        icon: ReceiptText,
      },
      {
        title: "Invoice Pembayaran",
        url: "/payment/bill/list",
        icon: Receipt,
      },
      // {
      //   title: "Riwayat Transaksi",
      //   url: "/admin/payment/history",
      //   icon: HistoryIcon,
      // },
    ],
  },
  {
    title: "Master Data",
    url: "#",
    role: ["Admin"],
    icon: Database,
    items: [
      {
        title: "Obat",
        url: "/master-data/medicine",
        icon: Pill,
      },
      {
        title: "Poli",
        url: "/master-data/poli",
        icon: Hospital,
      },
      {
        title: "Ruangan",
        url: "/master-data/room",
        icon: Bed,
      },
      {
        title: "Katalog Harga Layanan",
        url: "/master-data/service",
        icon: DollarSign,
      },
    ],
  },
  {
    title: "Laporan",
    url: "#",
    role: ["Admin"],
    icon: BarChart3,
    items: [
      {
        title: "Laporan Operasional",
        icon: Clipboard,
        items: [
          {
            title: "Overview Kunjungan Harian",
            url: "/reports/operations/overview",
          },
          {
            title: "Rekap Kunjungan Pasien",
            url: "/reports/operations/encounter",
          },
          {
            title: "Rekap Channel Pendaftaran",
            url: "/reports/operations/channel",
          },
        ],
      },
      {
        title: "Laporan Keuangan",
        icon: Wallet,
        items: [
          {
            title: "Overview Keuangan",
            url: "/reports/finance/overview",
          },
          {
            title: "Rekap Pembayaran Kunjungan",
            url: "/reports/finance/encounter",
          },
          {
            title: "Rekap Keuangan Farmasi",
            url: "/reports/finance/medicine",
          },
        ],
      },
      {
        title: "Laporan Obat",
        icon: Package2,
        items: [
          {
            title: "Overview Obat",
            url: "/reports/medicine/overview",
          },
          {
            title: "Rekap Inventarisasi Obat",
            url: "/reports/medicine/inventory",
          },
          {
            title: "Rekap Stok Obat",
            url: "/reports/medicine/recap",
          },
        ],
      },
    ],
  },
  // {
  //   title: "Role & User",
  //   url: "#",
  //   icon: Settings,
  //   items: [
  //     {
  //       title: "Manajemen Role",
  //       url: "/admin/role-and-user/manage-role",
  //       icon: Layers,
  //     },
  //     {
  //       title: "Manajemen User",
  //       url: "/admin/role-and-user/manage-user",
  //       icon: UserCheck,
  //     },
  //   ],
  // },
];

// Rest of the component code remains the same
type SubMenuItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
};

function isSubItemWithChildren(item: SubItem): item is SubItemWithChildren {
  return "items" in item;
}

export function Nav() {
  // const local = useLocalSet(() => ({
  //   role: user.role,
  //   openedMenu: [] as string[],
  // }));

  const isUrlActive = (url: string, location: string) => url === location;
  const hasUrl = (item: MenuItem | SubItem): item is MenuItem | SubMenuItem => {
    return "url" in item;
  };

  const [location] = useLocation();

  // useEffect(() => {
  //   local.set((data) => {
  //     data.openedMenu = [];
  //   });
  // }, [location]);

  const isMenuItemActive = (item: MenuItem | SubItem): boolean => {
    // if (local.openedMenu.includes(item.title)) return true;
    if ("items" in item && item.items) {
      return item.items.some((subItem) => isMenuItemActive(subItem));
    }
    if (hasUrl(item)) {
      return isUrlActive(item.url, location);
    }
    return false;
  };

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>{local.role}</SidebarGroupLabel> */}
      {/* <SidebarMenu>
        {items
          .filter((item) => item.role.includes(local.role))
          .map((item, index: number) =>
            item.items ? (
              <Collapsible
                key={index}
                open={isMenuItemActive(item)}
                onClick={() => {
                  local.set((data) => {
                    data.openedMenu = [];
                    if (data.openedMenu.includes(item.title)) {
                      data.openedMenu = data.openedMenu.filter(
                        (title) => title !== item.title
                      );
                    } else {
                      data.openedMenu.push(item.title);
                    }
                  });
                }}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={isMenuItemActive(item) ? "bg-gray-100" : ""}
                    >
                      {item.icon && (
                        <item.icon
                          className={`h-4 w-4 ${
                            isMenuItemActive(item) ? "text-primary" : ""
                          }`}
                        />
                      )}
                      <span
                        className={
                          isMenuItemActive(item)
                            ? "text-primary font-medium"
                            : ""
                        }
                      >
                        {item.title}
                      </span>
                      <ChevronRight
                        className={`ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 ${
                          isMenuItemActive(item) ? "text-primary" : ""
                        }`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="mr-0 pr-0">
                      {item.items?.map((subItem, index: number) => (
                        <Collapsible
                          key={index}
                          asChild
                          className="group/subcollapsible"
                          open={isMenuItemActive(subItem)}
                          onClick={(e) => {
                            e.stopPropagation();
                            local.set((data) => {
                              if (data.openedMenu.includes(subItem.title)) {
                                data.openedMenu = data.openedMenu.filter(
                                  (title) => title !== subItem.title
                                );
                              } else {
                                data.openedMenu.push(subItem.title);
                              }
                            });
                          }}
                        >
                          <SidebarMenuSubItem>
                            {isSubItemWithChildren(subItem) ? (
                              <>
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuSubButton
                                    className={`mr-0 cursor-pointer ${
                                      isMenuItemActive(subItem)
                                        ? "bg-gray-100"
                                        : ""
                                    }`}
                                  >
                                    {subItem.icon && (
                                      <subItem.icon
                                        className={`h-4 w-4 ${
                                          isMenuItemActive(subItem)
                                            ? "text-primary"
                                            : ""
                                        }`}
                                      />
                                    )}
                                    <span
                                      className={
                                        isMenuItemActive(subItem)
                                          ? "text-primary font-medium"
                                          : ""
                                      }
                                    >
                                      {subItem.title}
                                    </span>
                                    <ChevronRight
                                      className={`ml-auto h-3 w-3 transition-transform duration-200 group-data-[state=open]/subcollapsible:rotate-90 ${
                                        isMenuItemActive(subItem)
                                          ? "text-primary"
                                          : ""
                                      }`}
                                    />
                                  </SidebarMenuSubButton>
                                </CollapsibleTrigger>

                                <SidebarMenuSub className="mr-0 pr-0">
                                  <CollapsibleContent>
                                    {subItem.items.map((subsub) => (
                                      <a
                                        key={subsub.title}
                                        href={subsub.url}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          navigate(subsub.url);
                                        }}
                                        className={`block py-1 px-2 mt-1 text-sm hover:bg-gray-100 rounded cursor-pointer ${
                                          isUrlActive(subsub.url, location)
                                            ? "bg-gray-100 text-primary font-medium"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        {subsub.title}
                                      </a>
                                    ))}
                                  </CollapsibleContent>
                                </SidebarMenuSub>
                              </>
                            ) : (
                              <SidebarMenuSubButton asChild>
                                <a
                                  href={subItem.url}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigate(subItem.url);
                                  }}
                                  className={`cursor-pointer ${
                                    isUrlActive(subItem.url, location)
                                      ? "bg-gray-100"
                                      : ""
                                  }`}
                                >
                                  {subItem.icon && (
                                    <subItem.icon
                                      className={`h-4 w-4 ${
                                        isUrlActive(subItem.url, location)
                                          ? "text-primary"
                                          : ""
                                      }`}
                                    />
                                  )}
                                  <span
                                    className={
                                      isUrlActive(subItem.url, location)
                                        ? "text-primary font-medium"
                                        : ""
                                    }
                                  >
                                    {subItem.title}
                                  </span>
                                </a>
                              </SidebarMenuSubButton>
                            )}
                          </SidebarMenuSubItem>
                        </Collapsible>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <a
                  href={item.url}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.url);
                  }}
                >
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={
                      isUrlActive(item.url, location) ? "bg-gray-100" : ""
                    }
                  >
                    {item.icon && (
                      <item.icon
                        className={`h-4 w-4 ${
                          isUrlActive(item.url, location) ? "text-primary" : ""
                        }`}
                      />
                    )}
                    <span
                      className={
                        isUrlActive(item.url, location)
                          ? "text-primary font-medium"
                          : ""
                      }
                    >
                      {item.title}
                    </span>
                  </SidebarMenuButton>
                </a>
              </SidebarMenuItem>
            )
          )}
      </SidebarMenu> */}
    </SidebarGroup>
  );
}
