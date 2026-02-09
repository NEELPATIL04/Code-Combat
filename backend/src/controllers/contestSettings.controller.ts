import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';
import { contestSettings, contests } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Contest Settings Controller
 * Manages test mode, timing, and activity logging settings for contests
 */

/**
 * Get contest settings
 * GET /api/contests/:id/settings
 */
export const getContestSettings = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const contestId = parseInt(req.params.id as string);

    // Check if contest exists
    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId))
      .limit(1);

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Get settings or return defaults
    const [settings] = await db
      .select()
      .from(contestSettings)
      .where(eq(contestSettings.contestId, contestId))
      .limit(1);

    if (!settings) {
      // Return default settings if none exist
      return res.status(200).json({
        success: true,
        settings: {
          testModeEnabled: false,
          aiHintsEnabled: true,
          aiModeEnabled: true,
          fullScreenModeEnabled: false,
          allowCopyPaste: false,
          enableActivityLogs: false,
          requireCamera: false,
          requireMicrophone: false,
          requireScreenShare: false,
          perTaskTimeLimit: null,
          enablePerTaskTimer: false,
          autoStart: false,
          autoEnd: true,
          // AI Hint Configuration defaults
          maxHintsAllowed: 3,
          hintUnlockAfterSubmissions: 0,
          hintUnlockAfterSeconds: 0,
          provideLastSubmissionContext: true,
          // Submission Limits defaults
          maxSubmissionsAllowed: 0,
          autoSubmitOnTimeout: true,
          additionalSettings: {},
        },
      });
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update or create contest settings
 * PUT /api/contests/:id/settings
 */
export const updateContestSettings = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const contestId = parseInt(req.params.id as string);
    const {
      testModeEnabled,
      aiHintsEnabled,
      aiModeEnabled,
      fullScreenModeEnabled,
      allowCopyPaste,
      enableActivityLogs,
      requireCamera,
      requireMicrophone,
      requireScreenShare,
      perTaskTimeLimit,
      enablePerTaskTimer,
      autoStart,
      autoEnd,
      // AI Hint Configuration
      maxHintsAllowed,
      hintUnlockAfterSubmissions,
      hintUnlockAfterSeconds,
      provideLastSubmissionContext,
      // Submission Limits
      maxSubmissionsAllowed,
      autoSubmitOnTimeout,
      additionalSettings,
    } = req.body;

    // Check if contest exists
    const [contest] = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId))
      .limit(1);

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check if settings already exist
    const [existingSettings] = await db
      .select()
      .from(contestSettings)
      .where(eq(contestSettings.contestId, contestId))
      .limit(1);

    let updatedSettings;

    if (existingSettings) {
      // Update existing settings
      [updatedSettings] = await db
        .update(contestSettings)
        .set({
          testModeEnabled: testModeEnabled !== undefined ? testModeEnabled : existingSettings.testModeEnabled,
          aiHintsEnabled: aiHintsEnabled !== undefined ? aiHintsEnabled : existingSettings.aiHintsEnabled,
          aiModeEnabled: aiModeEnabled !== undefined ? aiModeEnabled : existingSettings.aiModeEnabled,
          fullScreenModeEnabled: fullScreenModeEnabled !== undefined ? fullScreenModeEnabled : existingSettings.fullScreenModeEnabled,
          allowCopyPaste: allowCopyPaste !== undefined ? allowCopyPaste : existingSettings.allowCopyPaste,
          enableActivityLogs: enableActivityLogs !== undefined ? enableActivityLogs : existingSettings.enableActivityLogs,
          requireCamera: requireCamera !== undefined ? requireCamera : existingSettings.requireCamera,
          requireMicrophone: requireMicrophone !== undefined ? requireMicrophone : existingSettings.requireMicrophone,
          requireScreenShare: requireScreenShare !== undefined ? requireScreenShare : existingSettings.requireScreenShare,
          perTaskTimeLimit: perTaskTimeLimit !== undefined ? perTaskTimeLimit : existingSettings.perTaskTimeLimit,
          enablePerTaskTimer: enablePerTaskTimer !== undefined ? enablePerTaskTimer : existingSettings.enablePerTaskTimer,
          autoStart: autoStart !== undefined ? autoStart : existingSettings.autoStart,
          autoEnd: autoEnd !== undefined ? autoEnd : existingSettings.autoEnd,
          // AI Hint Configuration
          maxHintsAllowed: maxHintsAllowed !== undefined ? maxHintsAllowed : existingSettings.maxHintsAllowed,
          hintUnlockAfterSubmissions: hintUnlockAfterSubmissions !== undefined ? hintUnlockAfterSubmissions : existingSettings.hintUnlockAfterSubmissions,
          hintUnlockAfterSeconds: hintUnlockAfterSeconds !== undefined ? hintUnlockAfterSeconds : existingSettings.hintUnlockAfterSeconds,
          provideLastSubmissionContext: provideLastSubmissionContext !== undefined ? provideLastSubmissionContext : existingSettings.provideLastSubmissionContext,
          // Submission Limits
          maxSubmissionsAllowed: maxSubmissionsAllowed !== undefined ? maxSubmissionsAllowed : existingSettings.maxSubmissionsAllowed,
          autoSubmitOnTimeout: autoSubmitOnTimeout !== undefined ? autoSubmitOnTimeout : existingSettings.autoSubmitOnTimeout,
          additionalSettings: additionalSettings || existingSettings.additionalSettings,
          updatedAt: new Date(),
        })
        .where(eq(contestSettings.id, existingSettings.id))
        .returning();
    } else {
      // Create new settings
      [updatedSettings] = await db
        .insert(contestSettings)
        .values({
          contestId,
          testModeEnabled: testModeEnabled ?? false,
          aiHintsEnabled: aiHintsEnabled ?? true,
          aiModeEnabled: aiModeEnabled ?? true,
          fullScreenModeEnabled: fullScreenModeEnabled ?? false,
          allowCopyPaste: allowCopyPaste ?? false,
          enableActivityLogs: enableActivityLogs ?? false,
          requireCamera: requireCamera ?? false,
          requireMicrophone: requireMicrophone ?? false,
          requireScreenShare: requireScreenShare ?? false,
          perTaskTimeLimit: perTaskTimeLimit ?? null,
          enablePerTaskTimer: enablePerTaskTimer ?? false,
          autoStart: autoStart ?? false,
          autoEnd: autoEnd ?? true,
          // AI Hint Configuration
          maxHintsAllowed: maxHintsAllowed ?? 3,
          hintUnlockAfterSubmissions: hintUnlockAfterSubmissions ?? 0,
          hintUnlockAfterSeconds: hintUnlockAfterSeconds ?? 0,
          provideLastSubmissionContext: provideLastSubmissionContext ?? true,
          // Submission Limits
          maxSubmissionsAllowed: maxSubmissionsAllowed ?? 0,
          autoSubmitOnTimeout: autoSubmitOnTimeout ?? true,
          additionalSettings: additionalSettings ?? null,
        })
        .returning();
    }

    return res.status(200).json({
      success: true,
      message: 'Contest settings updated successfully',
      settings: updatedSettings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete contest settings (reset to defaults)
 * DELETE /api/contests/:id/settings
 */
export const deleteContestSettings = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const contestId = parseInt(req.params.id as string);

    await db
      .delete(contestSettings)
      .where(eq(contestSettings.contestId, contestId));

    return res.status(200).json({
      success: true,
      message: 'Contest settings reset to defaults',
    });
  } catch (error) {
    next(error);
  }
};
