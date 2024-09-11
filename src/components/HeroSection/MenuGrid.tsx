import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAdsgram } from "@/hooks/useAdsgram";


interface MenuItemProps {
  iconSrc: string;
  label: string;
  route?: string;
  onReward?: () => void;
  onError?: (result:any) => void;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ iconSrc, label, route, onReward, onError, onClick }) => {
  const router = useRouter();

  // const handleNavigation = () => {
  //   router.push(route);
  // };

  return (
    <div
    onClick={onClick}
    className='flex flex-col justify-between items-center'
    >

    <div
      className="flex flex-col items-center justify-center bg-[#252423] p-4 rounded-xl border-b-2 border-custom-orange  text-center cursor-pointer hover:bg-gray-800 transition-colors"
      >
      <Image src={iconSrc} alt={label} width={20} height={20} />
    </div>
      <span className="text-white text-[0.5rem] mt-2">{label}</span>
      </div>
  );
};

const MenuGrid = () => {
  const onReward = useCallback(() => {
    alert('Reward');
  }, []);
  const onError = useCallback((result:any) => {
    alert(JSON.stringify(result, null, 4));
  }, []);


  const showAd = useAdsgram({ blockId: "2953", onReward, onError });


  const menuItems = [
    { iconSrc: '/icons/daily-gift.png', label: 'Daily reward',  onClick: showAd  },
    { iconSrc: '/icons/daily-ciper.png', label: 'Daily cipher', route: '/daily-cipher' },
    { iconSrc: '/icons/daily-combo.png', label: 'Daily combo', route: '/daily-combo' },
    { iconSrc: '/icons/settings.png', label: 'Settings', route: '/settings' },
    { iconSrc: '/icons/keys.png', label: 'Keys', route: '/keys' },
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {menuItems.map((item, index) => (
        <MenuItem key={index} iconSrc={item.iconSrc} label={item.label} route={item.route} onClick={item.onClick} />
      ))}
    </div>
  );
};

export default MenuGrid;
