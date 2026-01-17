/**
 * Leaderboard Page
 * Global leaderboard and friends rankings
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PixelAvatar } from '@/components/PixelAvatar';
import { mockUsers } from '@/mocks/data';
import './Leaderboard.css';

/**
 * Leaderboard - Rankings page
 */
export const Leaderboard: React.FC = () => {
  const router = useRouter();
  
  // Sort users by XP
  const rankedUsers = [...mockUsers].sort((a, b) => b.xp - a.xp);
  const topThree = rankedUsers.slice(0, 3);

  const handleRowClick = (userId: string) => {
    router.push(`/user/${userId}`);
  };

  return (
    <div className="leaderboard">
      <header className="leaderboard__header">
        <h1 className="leaderboard__title">🏆 Leaderboard</h1>
        <p className="leaderboard__subtitle">Top farmers this season</p>
      </header>

      {/* Podium */}
      <div className="leaderboard__podium">
        {/* Second place */}
        <div className="leaderboard__podium-spot leaderboard__podium-spot--2">
          <Link href={`/user/${topThree[1]?.id}`} className="leaderboard__link">
            <div className="leaderboard__podium-avatar leaderboard__podium-avatar--silver">
               <PixelAvatar username={topThree[1]?.username} seed={topThree[1]?.avatarSeed} size="medium" />
            </div>
            <span className="leaderboard__podium-name">{topThree[1]?.displayName}</span>
          </Link>
          <span className="leaderboard__podium-xp">{topThree[1]?.xp} XP</span>
          <div className="leaderboard__podium-stand leaderboard__podium-stand--silver">2</div>
        </div>

        {/* First place */}
        <div className="leaderboard__podium-spot leaderboard__podium-spot--1">
          <span className="leaderboard__crown">👑</span>
          <Link href={`/user/${topThree[0]?.id}`} className="leaderboard__link">
            <div className="leaderboard__podium-avatar leaderboard__podium-avatar--gold">
               <PixelAvatar username={topThree[0]?.username} seed={topThree[0]?.avatarSeed} size="medium" />
            </div>
            <span className="leaderboard__podium-name">{topThree[0]?.displayName}</span>
          </Link>
          <span className="leaderboard__podium-xp">{topThree[0]?.xp} XP</span>
          <div className="leaderboard__podium-stand leaderboard__podium-stand--gold">1</div>
        </div>

        {/* Third place */}
        <div className="leaderboard__podium-spot leaderboard__podium-spot--3">
          <Link href={`/user/${topThree[2]?.id}`} className="leaderboard__link">
            <div className="leaderboard__podium-avatar leaderboard__podium-avatar--bronze">
               <PixelAvatar username={topThree[2]?.username} seed={topThree[2]?.avatarSeed} size="medium" />
            </div>
            <span className="leaderboard__podium-name">{topThree[2]?.displayName}</span>
          </Link>
          <span className="leaderboard__podium-xp">{topThree[2]?.xp} XP</span>
          <div className="leaderboard__podium-stand leaderboard__podium-stand--bronze">3</div>
        </div>
      </div>

      {/* Full Rankings */}
      <div className="leaderboard__list">
        <table className="leaderboard__table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Farmer</th>
              <th>Level</th>
              <th>XP</th>
            </tr>
          </thead>
          <tbody>
            {rankedUsers.map((user, index) => (
              <tr 
                key={user.id} 
                className={`leaderboard__row ${index < 3 ? 'leaderboard__row--top' : ''}`}
                onClick={() => handleRowClick(user.id)}
              >
                <td className="leaderboard__rank">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </td>
                <td className="leaderboard__user">
                  <div className="leaderboard__user-wrapper">
                    <div className="leaderboard__user-avatar">
                      <PixelAvatar username={user.username} seed={user.avatarSeed} size="small" />
                    </div>
                    <span className="leaderboard__user-name">{user.displayName}</span>
                  </div>
                </td>
                <td className="leaderboard__level">Lv.{user.level}</td>
                <td className="leaderboard__xp">{user.xp.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
