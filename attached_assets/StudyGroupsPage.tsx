import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import StudyTabs from "@/components/study/StudyTabs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import StudyGroupList from "@/components/groups/StudyGroupList";
import CreateStudyGroup from "@/components/groups/CreateStudyGroup";

const StudyGroupsPage = () => {
  const [location] = useLocation();
  const isCreatePage = location === "/study/groups/create";
  
  // Check if we're viewing a specific group
  const isGroupDetailPage = location.startsWith("/study/groups/") && location !== "/study/groups/create";
  
  return (
    <>
      <Helmet>
        <title>
          {isCreatePage 
            ? "Create Study Group - DocDot" 
            : isGroupDetailPage 
              ? "Study Group Details - DocDot" 
              : "Study Groups - DocDot"}
        </title>
        <meta 
          name="description" 
          content={isCreatePage 
            ? "Create a new study group to collaborate with other medical students on similar topics of interest." 
            : "Join or create study groups to collaborate with other medical students and enhance your learning."}
        />
      </Helmet>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={isCreatePage || isGroupDetailPage ? "/study/groups" : "/study"}>
            <Button variant="ghost" className="inline-flex items-center px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {isCreatePage || isGroupDetailPage ? "Back to Study Groups" : "Back to Study Center"}
            </Button>
          </Link>
        </div>

        {!isCreatePage && !isGroupDetailPage && (
          <StudyTabs />
        )}
        
        {isCreatePage ? (
          <CreateStudyGroup />
        ) : isGroupDetailPage ? (
          // This would be handled by the StudyGroupDetail component
          // which would be rendered via the router
          null
        ) : (
          <Tabs defaultValue="all" className="mb-8">
            <TabsList>
              <TabsTrigger value="all">All Groups</TabsTrigger>
              <TabsTrigger value="my-groups">My Groups</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <StudyGroupList />
            </TabsContent>
            <TabsContent value="my-groups">
              <StudyGroupList myGroups={true} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </>
  );
};

export default StudyGroupsPage;
