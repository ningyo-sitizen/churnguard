import { useState } from "react";
import { UserCircle, LogOut, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = ({ formData, profileImg }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-end px-10 sticky top-0 z-50">

            <div className="relative">

                {/* TRIGGER */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 cursor-pointer"
                >

                    <img
                        src={
                            profileImg
                                ? profileImg
                                : `https://ui-avatars.com/api/?name=${formData?.name || "User"}`
                        }
                        className="w-10 h-10 rounded-xl"
                        alt="avatar"
                    />
                    
                    <div>
                        <p className="text-sm font-semibold">
                            hai, {formData?.name?.split(" ")[0] || "User"}
                        </p>

                        <p className="text-xs text-[#D82F5A]">
                            {formData?.email || "-"}
                        </p>
                    </div>

                </div>

                {/* DROPDOWN */}
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        <div className="absolute right-0 mt-4 w-72 bg-white rounded-[4px] shadow-xl border z-50">

                            {/* PROFILE HEADER */}
                            <div className="p-5 flex items-center gap-4">

                                <img
                                    src={
                                        profileImg
                                            ? profileImg
                                            : `https://ui-avatars.com/api/?name=${formData?.name || "User"}`
                                    }
                                    className="w-12 h-12 rounded-xl"
                                    alt="profile"
                                />

                                <div>
                                    <p className="font-semibold">
                                        {formData?.name}
                                    </p>

                                    <p className="text-xs text-[#D82F5A]">
                                        {formData.email}
                                    </p>
                                </div>

                            </div>

                            <div className="border-t" />

                            {/* MENU */}
                            <div className="p-2">

                                <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                                onClick={() => navigate('/profilepage')}
                                >
                                    
                                    <UserCircle size={18} />
                                    <span>Profile</span>
                                </div>

                                <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                                    <Crown size={18} />
                                    <span>Member</span>
                                </div>

                                <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer text-red-500">
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </div>

                            </div>

                        </div>
                    </>
                )}

            </div>

        </header>
    );
};

export default Header;