import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LucideProps,
  Home,
  Search,
  Settings,
  FileStack,
  GalleryHorizontal,
  Images,
  SquareDashedMousePointer,
  StickyNote,
} from 'lucide-react';
import Link from 'next/link';

type ItemsProps = {
  title: string;
  url: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >;
  children?: ItemsProps[];
};

const items = [
  {
    title: 'Home',
    url: '/',
    icon: Home,
  },
  {
    title: 'Gallery',
    url: '/gallery',
    icon: GalleryHorizontal,
    children: [
      {
        title: 'mask',
        url: '/gallery/mask',
        icon: Images,
      },
      {
        title: 'original',
        url: '/gallery',
        icon: Images,
      },
    ],
  },
  {
    title: 'Label',
    url: '/label',
    icon: SquareDashedMousePointer,
  },
  {
    title: 'Search',
    url: '',
    icon: Search,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
  {
    title: 'API Docs',
    url: 'http://127.0.0.1:8000/docs',
    icon: FileStack,
  },
  {
    title: 'Annotation Data',
    url: '/details',
    icon: StickyNote,
  },
];

const renderMenuItems = (items: ItemsProps[]) => {
  return items.map((item) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <Link href={item.url}>
          <item.icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
      {item.children && (
        <ul className="ml-4">{renderMenuItems(item.children)}</ul>
      )}
    </SidebarMenuItem>
  ));
};

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>SAM Labeler</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(items)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
