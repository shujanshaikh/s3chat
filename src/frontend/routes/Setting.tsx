import { ChevronLeft } from "lucide-react";
import { StoreApiKeyForm } from "../components/StoreApiKeyForm";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useUser } from "@clerk/clerk-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";

export default function Setting() {
  const { user } = useUser();
  const navigation = useNavigate();
  
  const handleBack = () => {
    navigation(-1);
  };

  return (
    <div className="bg-gradient-to-b from-pink-900/10 to-pink-900/20 min-h-screen text-white w-full no-scrollbar">
      {/* Mobile/Tablet Header */}
      <div className="lg:hidden sticky top-0 z-10 bg-gradient-to-r from-pink-900/20 to-pink-900/30 backdrop-blur-sm border-b border-pink-500/20 p-4">
        <Button 
          onClick={handleBack}  
          variant="outline" 
          className="bg-transparent border-pink-500/30 text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/50 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2"/>
          Back to Chat
        </Button>
        
        {/* Mobile User Info */}
        <div className="flex items-center space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="bg-pink-600 text-white">
              {user?.fullName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">{user?.fullName}</h2>
            <p className="text-gray-400 text-sm truncate">
              {user?.emailAddresses[0].emailAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="flex h-full w-full lg:p-10 lg:gap-10">
        {/* Desktop Sidebar - Hidden on mobile/tablet */}
        <div className="hidden lg:flex w-80 h-full p-6 flex-shrink-0 overflow-y-auto">
          <div className="w-full">
            <div className="flex mb-10"> 
              <Button 
                onClick={handleBack}  
                variant="outline" 
                className="bg-transparent border-pink-500/30 text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/50"
              >
                <ChevronLeft className="w-4 h-4 mr-2"/>
                Back to Chat
              </Button>
            </div>
            
            <div className="flex flex-col items-center mb-8">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="bg-pink-600 text-white text-xl">
                  {user?.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold mb-1 text-center">{user?.fullName}</h2>
              <p className="text-gray-400 text-sm mb-3 text-center break-all">
                {user?.emailAddresses[0].emailAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Settings Form */}
            <div className="w-full">
              <StoreApiKeyForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}