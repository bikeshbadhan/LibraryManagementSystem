import { Env } from '../types';
import { errorResponse, successResponse } from '../utils/helpers';

interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
  updated_at: string;
}

export async function getSettings(request: Request, env: Env): Promise<Response> {
  try {
    const settings = await env.DB.prepare(
      'SELECT key, value, description FROM settings'
    ).all<Setting>();
    
    // Convert to key-value object
    const settingsObj: Record<string, { value: string; description?: string }> = {};
    settings.results.forEach((setting: Setting) => {
      settingsObj[setting.key] = {
        value: setting.value,
        description: setting.description
      };
    });
    
    return successResponse(settingsObj);
  } catch (error) {
    console.error('Get settings error:', error);
    return errorResponse('Failed to get settings');
  }
}

export async function updateSettings(request: Request, env: Env): Promise<Response> {
  try {
    const updates = await request.json() as Record<string, string>;
    
    // Validate that keys exist
    const validKeys = ['default_borrowing_days', 'fine_per_day'];
    
    for (const [key, value] of Object.entries(updates)) {
      if (!validKeys.includes(key)) {
        return errorResponse(`Invalid setting key: ${key}`);
      }
      
      // Validate value is a positive number
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        return errorResponse(`Invalid value for ${key}: must be a positive number`);
      }
      
      await env.DB.prepare(
        'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?'
      ).bind(value, key).run();
    }
    
    return successResponse(null, 'Settings updated successfully');
  } catch (error) {
    console.error('Update settings error:', error);
    return errorResponse('Failed to update settings');
  }
}
