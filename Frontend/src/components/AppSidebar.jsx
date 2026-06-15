import * as React from "react";
import {
    Bike,
    Calendar,
    Camera,
    Users,
    MessageSquare,
    ChevronRight,
    LogOut,
    User,
    Settings,
    HelpCircle,
    ShieldCheck
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "./ui/sidebar";
import { cn } from "../lib/utils";
const buclogo = "/bucpng.png";

// Menu items.
const items = [
    {
        title: "Main Navigation",
        items: [
            {
                title: "Home",
                url: "/",
                icon: Bike,
            },
            {
                title: "Events",
                url: "/events",
                icon: Calendar,
            },
            {
                title: "Gallery",
                url: "/gallery",
                icon: Camera,
            },
        ],
    },
    {
        title: "Community",
        items: [
            {
                title: "Clubs",
                url: "/clubs",
                icon: Users,
            },
            {
                title: "Members",
                url: "/members",
                icon: Users,
            },
            {
                title: "Forum",
                url: "/forum",
                icon: MessageSquare,
            },
        ],
    },
]

export function AppSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isMobile, setOpenMobile } = useSidebar();

    // Example auth state - in real app this would come from a hook
    const isLoggedIn = localStorage.getItem('token') ? true : false;
    const userProfile = JSON.parse(localStorage.getItem('user')) || { fullName: "Member" };

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    const menuItems = [
        ...items[0].items,
        ...(isLoggedIn ? [{ title: "Your Events", url: "/your-events", icon: Calendar }] : [])
    ];

    return (
        <Sidebar variant="sidebar" collapsible="offcanvas" className="border-r border-blue-500/20 bg-[#020617]/95 backdrop-blur-2xl">
            <SidebarHeader className="p-6 border-b border-blue-500/10">
                <Link
                    to="/"
                    className="flex items-center gap-3 transition-opacity hover:opacity-80"
                    onClick={handleLinkClick}
                >
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-[#8B5CF6] rounded-lg blur opacity-25"></div>
                        <img
                            src={buclogo}
                            alt="BUC Logo"
                            className="relative h-10 w-10 rounded-lg border border-blue-500/30 object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-white text-lg tracking-tight leading-none font-['Audiowide']">Buc_India</span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">Ride Together</span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="p-4 gap-6">
                {items.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel className="px-2 text-xs font-bold text-blue-500/60 uppercase tracking-widest mb-2">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={location.pathname === item.url}
                                            className={cn(
                                                "transition-all duration-200",
                                                location.pathname === item.url
                                                    ? "bg-blue-500/10 text-blue-500 shadow-[inset_4px_0_0_0_theme(colors.blue.500)]"
                                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            <Link to={item.url} onClick={handleLinkClick} className="flex items-center gap-3 w-full py-2">
                                                <item.icon className={cn("h-5 w-5", location.pathname === item.url ? "text-blue-500" : "text-gray-400")} />
                                                <span className="font-bold text-sm tracking-tight">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}

                {isLoggedIn && (
                    <SidebarGroup>
                        <SidebarGroupLabel className="px-2 text-xs font-bold text-blue-500/60 uppercase tracking-widest mb-2">
                            Your Activity
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={location.pathname === "/your-events"}
                                        className={cn(
                                            "transition-all duration-200",
                                            location.pathname === "/your-events"
                                                ? "bg-blue-500/10 text-blue-500 shadow-[inset_4px_0_0_0_theme(colors.blue.500)]"
                                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <Link to="/your-events" onClick={handleLinkClick} className="flex items-center gap-3 w-full py-2">
                                            <Calendar className={cn("h-5 w-5", location.pathname === "/your-events" ? "text-blue-500" : "text-gray-400")} />
                                            <span className="font-bold text-sm tracking-tight">Your Events</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-blue-500/10">
                <div className="flex flex-col gap-2">
                    {isLoggedIn ? (
                        <div className="space-y-2">
                            <button
                                onClick={() => { navigate("/profile"); handleLinkClick(); }}
                                className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group border border-white/5"
                            >
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-[#8B5CF6] flex items-center justify-center text-white font-bold border-2 border-white/10 overflow-hidden shadow-lg">
                                    <span>{userProfile.fullName?.[0] || "M"}</span>
                                </div>
                                <div className="flex flex-col items-start overflow-hidden">
                                    <span className="text-sm font-bold text-white truncate w-full">{userProfile.fullName}</span>
                                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">View Profile</span>
                                </div>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            <Link
                                to="/login"
                                onClick={handleLinkClick}
                                className="px-3 py-2.5 rounded-xl text-center text-gray-400 font-bold text-xs border border-white/10 hover:bg-white/5 transition-all"
                            >
                                LOGIN
                            </Link>
                            <Link
                                to="/signup"
                                onClick={handleLinkClick}
                                className="px-3 py-2.5 rounded-xl text-center bg-gradient-to-r from-blue-500 to-[#8B5CF6] text-white font-bold text-xs transition-all hover:shadow-lg hover:shadow-blue-500/20"
                            >
                                SIGN UP
                            </Link>
                        </div>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
