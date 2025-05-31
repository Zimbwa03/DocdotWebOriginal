import { Link, useParams } from "wouter";
import LeaderboardTable from "@/components/stats/LeaderboardTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy } from "lucide-react";
import { Helmet } from "react-helmet";

const LeaderboardPage = () => {
  const params = useParams<{ category?: string; subcategory?: string }>();
  const { category, subcategory } = params;
  
  // Decode the subcategory if it exists
  const decodedSubcategory = subcategory ? decodeURIComponent(subcategory) : undefined;

  return (
    <>
      <Helmet>
        <title>
          {category 
            ? subcategory 
              ? `${category} / ${decodedSubcategory} Leaderboard - DocDot` 
              : `${category} Leaderboard - DocDot` 
            : "Global Leaderboard - DocDot"}
        </title>
        <meta 
          name="description" 
          content="See how you rank among other medical students. View top performers across all categories and subcategories."
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        {/* Navigation breadcrumb */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="inline-flex items-center px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Trophy className="mr-3 h-8 w-8 text-amber-500" />
            {category 
              ? subcategory 
                ? `${category} / ${decodedSubcategory} Leaderboard` 
                : `${category} Leaderboard` 
              : "Global Leaderboard"}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            See how you rank among other medical students.
          </p>
        </div>
        
        {/* Leaderboard */}
        <div className="space-y-8">
          <LeaderboardTable category={category} subcategory={decodedSubcategory} />
          
          {/* Leaderboard info */}
          <Card>
            <CardHeader>
              <CardTitle>About the Leaderboard</CardTitle>
              <CardDescription>How scoring and ranking works</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Scoring System</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Your rank is primarily determined by your accuracy (percentage of correct answers). 
                  For ties in accuracy, the total number of questions answered will be used as a tiebreaker.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Streaks</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Maintaining a daily streak by taking at least one quiz per day can improve your rank. 
                  Streaks demonstrate commitment to learning and are displayed on the leaderboard.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Categories</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  You can view leaderboards for specific categories or subcategories to see how you rank in your areas of interest or expertise.
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-center gap-4">
                  <Link href="/quiz/all">
                    <Button>
                      Take a Quiz
                    </Button>
                  </Link>
                  <Link href="/stats">
                    <Button variant="outline">
                      View My Stats
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default LeaderboardPage;