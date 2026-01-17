/**
 * Leaderboard Page
 * Global leaderboard and friends rankings
 */

import React from 'react';
import { mockUsers } from '@/mocks/data';
import './Leaderboard.css';

/**
 * Leaderboard - Rankings page
 */
export const Leaderboard: React.FC = () => {
  // Sort users by XP
  const rankedUsers = [...mockUsers].sort((a, b) => b.xp - a.xp);
  const topThree = rankedUsers.slice(0, 3);

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
          <div className="leaderboard__podium-avatar">
            <span>👤</span>
          </div>
          <span className="leaderboard__podium-name">{topThree[1]?.displayName}</span>
          <span className="leaderboard__podium-xp">{topThree[1]?.xp} XP</span>
          <div className="leaderboard__podium-stand">2</div>
        </div>

        {/* First place */}
        <div className="leaderboard__podium-spot leaderboard__podium-spot--1">
          <span className="leaderboard__crown">👑</span>
          <div className="leaderboard__podium-avatar leaderboard__podium-avatar--gold">
            <span>👤</span>
          </div>
          <span className="leaderboard__podium-name">{topThree[0]?.displayName}</span>
          <span className="leaderboard__podium-xp">{topThree[0]?.xp} XP</span>
          <div className="leaderboard__podium-stand leaderboard__podium-stand--gold">1</div>
        </div>

        {/* Third place */}
        <div className="leaderboard__podium-spot leaderboard__podium-spot--3">
          <div className="leaderboard__podium-avatar">
            <span>👤</span>
          </div>
          <span className="leaderboard__podium-name">{topThree[2]?.displayName}</span>
          <span className="leaderboard__podium-xp">{topThree[2]?.xp} XP</span>
          <div className="leaderboard__podium-stand">3</div>
        </div>
      </div>

      {/* Full Rankings */}
      <div className="leaderboard__list nes-container is-dark">
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
              <tr key={user.id} className={index < 3 ? 'leaderboard__row--top' : ''}>
                <td className="leaderboard__rank">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </td>
                <td className="leaderboard__user">
                  <span className="leaderboard__user-avatar">👤</span>
                  <span className="leaderboard__user-name">{user.displayName}</span>
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
