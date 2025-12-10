// /api/messages/recent.js
import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    // Get user role
    const userQuery = `
      SELECT is_admin, is_poster 
      FROM users 
      WHERE id = $1
    `;
    const userResult = await pool.query(userQuery, [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { is_admin, is_poster } = userResult.rows[0];

    // 1️⃣ Poster/admin: full access to chatrooms they are involved in
    if (is_admin || is_poster) {
      const query = `
        SELECT
          o.id AS opdracht_id,
          o.title AS opdracht_title,

          -- latest message
          (
            SELECT message 
            FROM messages 
            WHERE opdracht_id = o.id 
            ORDER BY created_at DESC 
            LIMIT 1
          ) AS latest_message,

          (
            SELECT created_at 
            FROM messages 
            WHERE opdracht_id = o.id 
            ORDER BY created_at DESC 
            LIMIT 1
          ) AS latest_message_time,

          -- author of latest message
          (
            SELECT name 
            FROM users 
            WHERE id = (
              SELECT user_id 
              FROM messages 
              WHERE opdracht_id = o.id 
              ORDER BY created_at DESC 
              LIMIT 1
            )
          ) AS name,

          (
            SELECT last_name 
            FROM users 
            WHERE id = (
              SELECT user_id 
              FROM messages 
              WHERE opdracht_id = o.id 
              ORDER BY created_at DESC 
              LIMIT 1
            )
          ) AS last_name,

          -- unread count (messages NOT from current user)
          (
            SELECT COUNT(*) 
            FROM messages 
            WHERE opdracht_id = o.id
            AND user_id != $1
            AND is_read = FALSE
          ) AS unread_count

        FROM opdrachten o
        WHERE o.id IN (
          SELECT DISTINCT opdracht_id 
          FROM messages 
          WHERE opdracht_id IN (
            SELECT DISTINCT opdracht_id
            FROM messages
          )
        )
        ORDER BY 
          -- unread first
          (SELECT COUNT(*) 
           FROM messages 
           WHERE opdracht_id = o.id
           AND user_id != $1
           AND is_read = FALSE) DESC,
          
          -- oldest unread → newest unread
          (SELECT MIN(created_at)
           FROM messages 
           WHERE opdracht_id = o.id
           AND user_id != $1
           AND is_read = FALSE) ASC NULLS LAST,

          -- lastly sort read messages oldest → newest
          (SELECT MIN(created_at) 
           FROM messages 
           WHERE opdracht_id = o.id) ASC
      `;

      const result = await pool.query(query, [userId]);
      return res.status(200).json({ chatrooms: result.rows });
    }

    // 2️⃣ Worker: restricted access — only AFTER poster/admin replies
    const workerQuery = `
      SELECT
        o.id AS opdracht_id,
        o.title AS opdracht_title,

        (
          SELECT message 
          FROM messages 
          WHERE opdracht_id = o.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) AS latest_message,

        (
          SELECT created_at 
          FROM messages 
          WHERE opdracht_id = o.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) AS latest_message_time,

        (
          SELECT name 
          FROM users 
          WHERE id = (
            SELECT user_id 
            FROM messages 
            WHERE opdracht_id = o.id 
            ORDER BY created_at DESC 
            LIMIT 1
          )
        ) AS name,

        (
          SELECT last_name 
          FROM users 
          WHERE id = (
            SELECT user_id 
            FROM messages 
            WHERE opdracht_id = o.id
            ORDER BY created_at DESC
            LIMIT 1
          )
        ) AS last_name,

        (
          SELECT COUNT(*) 
          FROM messages 
          WHERE opdracht_id = o.id
          AND user_id != $1
          AND is_read = FALSE
        ) AS unread_count

      FROM opdrachten o
      WHERE o.id IN (

        -- worker is allowed to see chatroom ONLY if
        -- poster/admin has replied
        SELECT opdracht_id
        FROM messages
        WHERE opdracht_id IN (
          SELECT DISTINCT opdracht_id
          FROM messages
          WHERE user_id = $1  -- worker sent first message
        )
        AND user_id != $1      -- someone else replied
      )

      ORDER BY 
        (SELECT COUNT(*) 
         FROM messages 
         WHERE opdracht_id = o.id
         AND user_id != $1
         AND is_read = FALSE) DESC,

        (SELECT MIN(created_at)
         FROM messages 
         WHERE opdracht_id = o.id
         AND user_id != $1
         AND is_read = FALSE) ASC NULLS LAST,

        (SELECT MIN(created_at) 
         FROM messages 
         WHERE opdracht_id = o.id) ASC
    `;

    const workerResult = await pool.query(workerQuery, [userId]);
    return res.status(200).json({ chatrooms: workerResult.rows });

  } catch (err) {
    console.error('Error fetching chatrooms:', err);
    return res.status(500).json({
      error: 'Kan chatrooms niet ophalen',
      detail: err.message
    });
  }
}
