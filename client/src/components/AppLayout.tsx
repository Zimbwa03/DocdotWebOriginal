import { SidebarNavigation } from './SidebarNavigation';
import { PageHeader } from './PageHeader';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function AppLayout({ children, title, description, actions, breadcrumbs }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <SidebarNavigation />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PageHeader 
          title={title}
          description={description}
          actions={actions}
          breadcrumbs={breadcrumbs}
        />
        
        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}