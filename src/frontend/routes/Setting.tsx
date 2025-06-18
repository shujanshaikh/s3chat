import { StoreApiKeyForm } from "../components/StoreApiKeyForm";

import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

import { useUser } from "@clerk/clerk-react";

export default function Setting() {
  const { user } = useUser();

  return (
    <div className=" bg-gradient-to-b from-purple-900/10 to-purple-900/20 h-full min-h-screen text-white w-full  no-scrollbar">
      <div className="flex h-full w-full p-10 gap-10">
        {/* Left Sidebar */}
        <div className="w-80 h-full p-6 flex-shrink-0 overflow-y-auto ">
          {" "}
          {/* Added overflow-y-auto in case sidebar content is long */}
          <div className="flex flex-col items-center mb-8">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="bg-gray-600 text-white text-xl">
                {user?.fullName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold mb-1">{user?.fullName}</h2>
            <p className="text-gray-400 text-sm mb-3">
              {user?.emailAddresses[0].emailAddress}
            </p>
          </div>
        </div>

        {/* Main Content */}
        {/* Removed justify-center items-center */}
        <div className="flex-1 p-6 overflow-y-auto">
          {" "}
          {/* Kept p-6 and overflow-y-auto */}
          <StoreApiKeyForm />
        </div>
      </div>
    </div>
  );
}
