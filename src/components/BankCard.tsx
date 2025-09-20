// import { formatAmount } from '@/lib/utils'
// import Image from 'next/image'
// import Link from 'next/link'
// import React from 'react'
// import Copy from './Copy'

// const BankCard = ({ account, userName, showBalance = true }: CreditCardProps) => {

//   console.log(account);
//   return (
//     <div className="flex flex-col">
//       <Link href={`/transaction-history/?id=${account.appwriteItemId}`} className="bank-card">
//         <div className="bank-card_content">
//           <div>
//             <h1 className="text-16 font-semibold text-white">
//               {account.name}
//             </h1>
//             <p className="font-ibm-plex-serif font-black text-white">
//               {formatAmount(account.currentBalance)}
//             </p>
//           </div>

//           <article className="flex flex-col gap-2">
//             <div className="flex justify-between">
//               <h1 className="text-12 font-semibold text-white">
//                 {userName}
//               </h1>
//               <h2 className="text-12 font-semibold text-white">
//               ●● / ●●
//               </h2>
//             </div>
//             <p className="text-14 font-semibold tracking-[1.1px] text-white">
//               ●●●● ●●●● ●●●● <span className="text-16">{account?.mask}</span>
//             </p>
//           </article>
//         </div>

//         <div className="bank-card_icon">
//           <Image 
//             src="/icons/Paypass.svg"
//             width={20}
//             height={24}
//             alt="pay"
//           />
//           <Image 
//             src="/icons/mastercard.svg"
//             width={45}
//             height={32}
//             alt="mastercard"
//             className="ml-5"
//           />
//         </div>

//         <Image 
//           src="/icons/lines.png"
//           width={316}
//           height={190}
//           alt="lines"
//           className="absolute top-0 left-0"
//         />
//       </Link>

//       {showBalance && <Copy title={account?.sharaebleId} />}
//     </div>
//   )
// }

// export default BankCard


import React from 'react';
import { Link } from 'react-router-dom';

// Define TypeScript interfaces
interface Account {
  appwriteItemId: string;
  name: string;
  currentBalance: number;
  mask: string;
  sharaebleId?: string;
}

interface CreditCardProps {
  account: Account;
  userName: string;
  showBalance?: boolean;
}

// Function to format amount (replacing the imported formatAmount)
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Copy component (simplified version of the imported Copy)
const Copy: React.FC<{ title?: string }> = ({ title }) => {
  const handleCopy = () => {
    if (title) {
      navigator.clipboard.writeText(title);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="mt-2 cursor-pointer text-center" onClick={handleCopy}>
      <span className="text-sm text-gray-600">ID: {title}</span>
    </div>
  );
};

const BankCard: React.FC<CreditCardProps> = ({ 
  account, 
  userName, 
  showBalance = true 
}) => {
  console.log(account);
  
  return (
    <div className="flex flex-col">
      <Link to={`/transaction-history/?id=${account.appwriteItemId}`} className="bank-card">
        <div className="bank-card_content">
          <div>
            <h1 className="text-16 font-semibold text-white">
              {account.name}
            </h1>
            <p className="font-ibm-plex-serif font-black text-white">
              {formatAmount(account.currentBalance)}
            </p>
          </div>

          <article className="flex flex-col gap-2">
            <div className="flex justify-between">
              <h1 className="text-12 font-semibold text-white">
                {userName}
              </h1>
              <h2 className="text-12 font-semibold text-white">
                ●● / ●●
              </h2>
            </div>
            <p className="text-14 font-semibold tracking-[1.1px] text-white">
              ●●●● ●●●● ●●●● <span className="text-16">{account?.mask}</span>
            </p>
          </article>
        </div>

        <div className="bank-card_icon">
          <img 
            src="/icons/Paypass.svg"
            width={20}
            height={24}
            alt="pay"
          />
          <img 
            src="/icons/mastercard.svg"
            width={45}
            height={32}
            alt="mastercard"
            className="ml-5"
          />
        </div>

        <img 
          src="/icons/lines.png"
          width={316}
          height={190}
          alt="lines"
          className="absolute top-0 left-0"
        />
      </Link>

      {showBalance && <Copy title={account?.sharaebleId} />}
    </div>
  );
};

export default BankCard;