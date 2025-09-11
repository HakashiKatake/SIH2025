import { FarmingRoadmap, IFarmingRoadmap, IMilestone, IMRLRecommendation } from '../models/FarmingRoadmap';
import { User } from '../models/User';
import mongoose from 'mongoose';

// Interface for roadmap generation request
export interface RoadmapGenerationRequest {
  cropType: string;
  variety?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    state: string;
    district: string;
  };
  farmSize?: number;
  sowingDate: Date;
  preferredLanguage?: string;
}

// Interface for milestone update
export interface MilestoneUpdate {
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedDate?: Date;
  notes?: string;
}

// Interface for progress update
export interface ProgressUpdate {
  milestoneId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedDate?: Date;
  notes?: string;
}

// Crop-specific data for roadmap generation
const CROP_DATA: Record<string, {
  growthPeriod: number; // days
  stages: Array<{
    name: string;
    category: IMilestone['category'];
    dayOffset: number;
    duration: number;
    priority: IMilestone['priority'];
    weatherDependent: boolean;
    description: string;
    resources?: string[];
  }>;
  mrlRecommendations: Partial<IMRLRecommendation>[];
}> = {
  rice: {
    growthPeriod: 120,
    stages: [
      {
        name: 'Land Preparation',
        category: 'sowing',
        dayOffset: -7,
        duration: 3,
        priority: 'high',
        weatherDependent: true,
        description: 'Prepare the field by plowing and leveling',
        resources: ['Tractor', 'Plow', 'Leveler']
      },
      {
        name: 'Seed Sowing',
        category: 'sowing',
        dayOffset: 0,
        duration: 2,
        priority: 'critical',
        weatherDependent: true,
        description: 'Sow rice seeds in prepared nursery beds',
        resources: ['Quality seeds', 'Nursery beds']
      },
      {
        name: 'First Irrigation',
        category: 'irrigation',
        dayOffset: 3,
        duration: 1,
        priority: 'high',
        weatherDependent: false,
        description: 'Provide initial irrigation to seedlings'
      },
      {
        name: 'Transplanting',
        category: 'sowing',
        dayOffset: 25,
        duration: 3,
        priority: 'critical',
        weatherDependent: true,
        description: 'Transplant seedlings to main field',
        resources: ['Healthy seedlings', 'Labor']
      },
      {
        name: 'First Fertilizer Application',
        category: 'fertilizer',
        dayOffset: 30,
        duration: 1,
        priority: 'high',
        weatherDependent: false,
        description: 'Apply basal fertilizer (NPK)',
        resources: ['NPK fertilizer']
      },
      {
        name: 'Weed Control',
        category: 'pest_control',
        dayOffset: 40,
        duration: 2,
        priority: 'medium',
        weatherDependent: false,
        description: 'Remove weeds manually or apply herbicide',
        resources: ['Herbicide', 'Labor']
      },
      {
        name: 'Second Fertilizer Application',
        category: 'fertilizer',
        dayOffset: 60,
        duration: 1,
        priority: 'high',
        weatherDependent: false,
        description: 'Apply top dressing fertilizer',
        resources: ['Urea fertilizer']
      },
      {
        name: 'Pest Monitoring',
        category: 'pest_control',
        dayOffset: 70,
        duration: 1,
        priority: 'medium',
        weatherDependent: false,
        description: 'Monitor for pests and diseases'
      },
      {
        name: 'Flowering Stage Care',
        category: 'general',
        dayOffset: 80,
        duration: 5,
        priority: 'high',
        weatherDependent: true,
        description: 'Monitor flowering and ensure adequate water'
      },
      {
        name: 'Pre-harvest Preparation',
        category: 'harvesting',
        dayOffset: 110,
        duration: 3,
        priority: 'medium',
        weatherDependent: false,
        description: 'Prepare for harvesting, check grain maturity'
      },
      {
        name: 'Harvesting',
        category: 'harvesting',
        dayOffset: 120,
        duration: 5,
        priority: 'critical',
        weatherDependent: true,
        description: 'Harvest mature rice crop',
        resources: ['Harvesting equipment', 'Labor', 'Storage bags']
      }
    ],
    mrlRecommendations: [
      {
        pesticide: 'Chlorpyrifos',
        dosage: '2ml/L',
        applicationMethod: 'Foliar spray',
        safetyPeriod: 21,
        targetPest: 'Brown planthopper',
        mrlLimit: 0.05
      },
      {
        pesticide: 'Carbendazim',
        dosage: '1g/L',
        applicationMethod: 'Foliar spray',
        safetyPeriod: 14,
        targetPest: 'Blast disease',
        mrlLimit: 0.1
      }
    ]
  },
  wheat: {
    growthPeriod: 150,
    stages: [
      {
        name: 'Land Preparation',
        category: 'sowing',
        dayOffset: -5,
        duration: 2,
        priority: 'high',
        weatherDependent: true,
        description: 'Prepare field with deep plowing and harrowing'
      },
      {
        name: 'Seed Sowing',
        category: 'sowing',
        dayOffset: 0,
        duration: 3,
        priority: 'critical',
        weatherDependent: true,
        description: 'Sow wheat seeds at optimal depth and spacing'
      },
      {
        name: 'First Irrigation',
        category: 'irrigation',
        dayOffset: 21,
        duration: 1,
        priority: 'high',
        weatherDependent: false,
        description: 'Crown root irrigation (CRI)'
      },
      {
        name: 'First Fertilizer Application',
        category: 'fertilizer',
        dayOffset: 25,
        duration: 1,
        priority: 'high',
        weatherDependent: false,
        description: 'Apply nitrogen fertilizer'
      },
      {
        name: 'Second Irrigation',
        category: 'irrigation',
        dayOffset: 40,
        duration: 1,
        priority: 'high',
        weatherDependent: false,
        description: 'Late tillering irrigation'
      },
      {
        name: 'Weed Control',
        category: 'pest_control',
        dayOffset: 45,
        duration: 1,
        priority: 'medium',
        weatherDependent: false,
        description: 'Apply post-emergence herbicide'
      },
      {
        name: 'Third Irrigation',
        category: 'irrigation',
        dayOffset: 60,
        duration: 1,
        priority: 'high',
        weatherDependent: false,
        description: 'Jointing stage irrigation'
      },
      {
        name: 'Fourth Irrigation',
        category: 'irrigation',
        dayOffset: 80,
        duration: 1,
        priority: 'high',
        weatherDependent: false,
        description: 'Flowering stage irrigation'
      },
      {
        name: 'Fifth Irrigation',
        category: 'irrigation',
        dayOffset: 100,
        duration: 1,
        priority: 'high',
        weatherDependent: false,
        description: 'Milk stage irrigation'
      },
      {
        name: 'Sixth Irrigation',
        category: 'irrigation',
        dayOffset: 120,
        duration: 1,
        priority: 'medium',
        weatherDependent: false,
        description: 'Dough stage irrigation'
      },
      {
        name: 'Harvesting',
        category: 'harvesting',
        dayOffset: 150,
        duration: 5,
        priority: 'critical',
        weatherDependent: true,
        description: 'Harvest mature wheat crop'
      }
    ],
    mrlRecommendations: [
      {
        pesticide: 'Mancozeb',
        dosage: '2g/L',
        applicationMethod: 'Foliar spray',
        safetyPeriod: 14,
        targetPest: 'Rust diseases',
        mrlLimit: 0.5
      }
    ]
  },
  tomato: {
    growthPeriod: 90,
    stages: [
      {
        name: 'Nursery Preparation',
        category: 'sowing',
        dayOffset: -30,
        duration: 2,
        priority: 'high',
        weatherDependent: false,
        description: 'Prepare nursery beds and sow seeds'
      },
      {
        name: 'Seedling Care',
        category: 'general',
        dayOffset: -25,
        duration: 25,
        priority: 'medium',
        weatherDependent: false,
        description: 'Water and care for seedlings in nursery'
      },
      {
        name: 'Land Preparation',
        category: 'sowing',
        dayOffset: -3,
        duration: 3,
        priority: 'high',
        weatherDependent: true,
        description: 'Prepare main field with organic matter'
      },
      {
        name: 'Transplanting',
        category: 'sowing',
        dayOffset: 0,
        duration: 2,
        priority: 'critical',
        weatherDependent: true,
        description: 'Transplant seedlings to main field'
      },
      {
        name: 'First Irrigation',
        category: 'irrigation',
        dayOffset: 1,
        duration: 1,
        priority: 'high',
        weatherDependent: false,
        description: 'Water immediately after transplanting'
      },
      {
        name: 'Staking',
        category: 'general',
        dayOffset: 15,
        duration: 2,
        priority: 'medium',
        weatherDependent: false,
        description: 'Provide support stakes for plants'
      },
      {
        name: 'First Fertilizer Application',
        category: 'fertilizer',
        dayOffset: 20,
        duration: 1,
        priority: 'high',
        weatherDependent: false,
        description: 'Apply NPK fertilizer'
      },
      {
        name: 'Pest Monitoring',
        category: 'pest_control',
        dayOffset: 30,
        duration: 1,
        priority: 'high',
        weatherDependent: false,
        description: 'Monitor for early blight and pests'
      },
      {
        name: 'Flowering Stage Care',
        category: 'general',
        dayOffset: 45,
        duration: 10,
        priority: 'high',
        weatherDependent: false,
        description: 'Monitor flowering and fruit set'
      },
      {
        name: 'Fruit Development Care',
        category: 'general',
        dayOffset: 60,
        duration: 15,
        priority: 'medium',
        weatherDependent: false,
        description: 'Monitor fruit development and diseases'
      },
      {
        name: 'First Harvest',
        category: 'harvesting',
        dayOffset: 75,
        duration: 15,
        priority: 'critical',
        weatherDependent: false,
        description: 'Begin harvesting ripe tomatoes'
      }
    ],
    mrlRecommendations: [
      {
        pesticide: 'Imidacloprid',
        dosage: '0.5ml/L',
        applicationMethod: 'Foliar spray',
        safetyPeriod: 7,
        targetPest: 'Whitefly',
        mrlLimit: 0.05
      },
      {
        pesticide: 'Copper oxychloride',
        dosage: '2g/L',
        applicationMethod: 'Foliar spray',
        safetyPeriod: 14,
        targetPest: 'Early blight',
        mrlLimit: 5.0
      }
    ]
  }
};

export class RoadmapService {
  /**
   * Generate a farming roadmap based on crop type and location
   */
  static async generateRoadmap(
    roadmapData: RoadmapGenerationRequest, 
    userId: string
  ): Promise<IFarmingRoadmap> {
    try {
      // Verify user exists
      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      const { cropType, variety, location, farmSize, sowingDate } = roadmapData;
      
      // Get crop-specific data (default to generic if not found)
      const cropInfo = CROP_DATA[cropType.toLowerCase()] || CROP_DATA.rice;
      
      // Calculate estimated harvest date
      const estimatedHarvestDate = new Date(sowingDate);
      estimatedHarvestDate.setDate(estimatedHarvestDate.getDate() + cropInfo.growthPeriod);

      // Generate milestones based on crop data
      const milestones: IMilestone[] = cropInfo.stages.map(stage => {
        const scheduledDate = new Date(sowingDate);
        scheduledDate.setDate(scheduledDate.getDate() + stage.dayOffset);

        return {
          title: stage.name,
          description: stage.description,
          category: stage.category,
          scheduledDate,
          status: 'pending',
          priority: stage.priority,
          weatherDependent: stage.weatherDependent,
          estimatedDuration: stage.duration,
          resources: stage.resources || [],
          createdAt: new Date(),
          updatedAt: new Date()
        } as IMilestone;
      });

      // Create roadmap
      const roadmap = new FarmingRoadmap({
        userId,
        cropType,
        variety,
        location,
        farmSize,
        sowingDate,
        estimatedHarvestDate,
        currentStage: 'planning',
        milestones,
        mrlRecommendations: cropInfo.mrlRecommendations,
        weatherAlerts: true,
        isActive: true
      });

      await roadmap.save();
      
      // Populate user information
      await roadmap.populate('userId', 'name phone location.state location.district');
      
      return roadmap;
    } catch (error) {
      console.error('Error generating roadmap:', error);
      throw error;
    }
  }

  /**
   * Get user's active roadmaps
   */
  static async getUserRoadmaps(userId: string): Promise<IFarmingRoadmap[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }

      const roadmaps = await FarmingRoadmap.find({ 
        userId, 
        isActive: true 
      })
        .populate('userId', 'name phone location.state location.district')
        .sort({ createdAt: -1 })
        .lean();

      return roadmaps as IFarmingRoadmap[];
    } catch (error) {
      console.error('Error getting user roadmaps:', error);
      throw error;
    }
  }

  /**
   * Get roadmap by ID
   */
  static async getRoadmapById(roadmapId: string, userId?: string): Promise<IFarmingRoadmap | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(roadmapId)) {
        throw new Error('Invalid roadmap ID');
      }

      const query: any = { _id: roadmapId, isActive: true };
      if (userId) {
        query.userId = userId;
      }

      const roadmap = await FarmingRoadmap.findOne(query)
        .populate('userId', 'name phone location.state location.district');

      return roadmap;
    } catch (error) {
      console.error('Error getting roadmap by ID:', error);
      throw error;
    }
  }

  /**
   * Update milestone progress
   */
  static async updateMilestoneProgress(
    roadmapId: string,
    milestoneId: string,
    progressUpdate: ProgressUpdate,
    userId: string
  ): Promise<IFarmingRoadmap | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(roadmapId)) {
        throw new Error('Invalid roadmap ID');
      }

      // Find roadmap and verify ownership
      const roadmap = await FarmingRoadmap.findOne({ 
        _id: roadmapId, 
        userId, 
        isActive: true 
      });

      if (!roadmap) {
        throw new Error('Roadmap not found or you do not have permission to update it');
      }

      // Find and update the milestone
      const milestone = roadmap.milestones.find(m => m._id?.toString() === milestoneId);
      if (!milestone) {
        throw new Error('Milestone not found');
      }

      // Update milestone properties
      milestone.status = progressUpdate.status;
      if (progressUpdate.completedDate) {
        milestone.completedDate = progressUpdate.completedDate;
      } else if (progressUpdate.status === 'completed') {
        milestone.completedDate = new Date();
      }
      if (progressUpdate.notes) {
        milestone.notes = progressUpdate.notes;
      }
      milestone.updatedAt = new Date();

      // Save the roadmap (this will trigger the pre-save middleware to update progress)
      await roadmap.save();
      
      // Populate user information
      await roadmap.populate('userId', 'name phone location.state location.district');
      
      return roadmap;
    } catch (error) {
      console.error('Error updating milestone progress:', error);
      throw error;
    }
  }

  /**
   * Get upcoming milestones for a user
   */
  static async getUpcomingMilestones(
    userId: string, 
    days: number = 7
  ): Promise<Array<{ roadmap: IFarmingRoadmap; milestones: IMilestone[] }>> {
    try {
      const roadmaps = await FarmingRoadmap.find({ 
        userId, 
        isActive: true,
        currentStage: { $nin: ['completed'] }
      })
        .populate('userId', 'name phone location.state location.district');

      const result = roadmaps.map(roadmap => ({
        roadmap,
        milestones: roadmap.getUpcomingMilestones(days)
      })).filter(item => item.milestones.length > 0);

      return result;
    } catch (error) {
      console.error('Error getting upcoming milestones:', error);
      throw error;
    }
  }

  /**
   * Get overdue milestones for a user
   */
  static async getOverdueMilestones(
    userId: string
  ): Promise<Array<{ roadmap: IFarmingRoadmap; milestones: IMilestone[] }>> {
    try {
      const roadmaps = await FarmingRoadmap.find({ 
        userId, 
        isActive: true,
        currentStage: { $nin: ['completed'] }
      })
        .populate('userId', 'name phone location.state location.district');

      const result = roadmaps.map(roadmap => ({
        roadmap,
        milestones: roadmap.getOverdueMilestones()
      })).filter(item => item.milestones.length > 0);

      return result;
    } catch (error) {
      console.error('Error getting overdue milestones:', error);
      throw error;
    }
  }

  /**
   * Get MRL-based recommendations for a location
   */
  static async getMRLRecommendations(
    location: { state: string; district?: string },
    cropType?: string
  ): Promise<IMRLRecommendation[]> {
    try {
      const query: any = { 
        'location.state': location.state, 
        isActive: true 
      };
      
      if (location.district) {
        query['location.district'] = location.district;
      }
      
      if (cropType) {
        query.cropType = cropType;
      }

      // Get recent roadmaps from the same location
      const roadmaps = await FarmingRoadmap.find(query)
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      // Aggregate MRL recommendations
      const allRecommendations: IMRLRecommendation[] = [];
      roadmaps.forEach(roadmap => {
        if (roadmap.mrlRecommendations) {
          allRecommendations.push(...roadmap.mrlRecommendations);
        }
      });

      // Remove duplicates based on pesticide name
      const uniqueRecommendations = allRecommendations.filter((rec, index, self) => 
        index === self.findIndex(r => r.pesticide === rec.pesticide)
      );

      return uniqueRecommendations;
    } catch (error) {
      console.error('Error getting MRL recommendations:', error);
      throw error;
    }
  }

  /**
   * Update roadmap settings
   */
  static async updateRoadmapSettings(
    roadmapId: string,
    settings: { weatherAlerts?: boolean; isActive?: boolean },
    userId: string
  ): Promise<IFarmingRoadmap | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(roadmapId)) {
        throw new Error('Invalid roadmap ID');
      }

      const roadmap = await FarmingRoadmap.findOneAndUpdate(
        { _id: roadmapId, userId, isActive: true },
        { $set: settings },
        { new: true }
      ).populate('userId', 'name phone location.state location.district');

      return roadmap;
    } catch (error) {
      console.error('Error updating roadmap settings:', error);
      throw error;
    }
  }

  /**
   * Delete roadmap (soft delete)
   */
  static async deleteRoadmap(roadmapId: string, userId: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(roadmapId)) {
        throw new Error('Invalid roadmap ID');
      }

      const result = await FarmingRoadmap.updateOne(
        { _id: roadmapId, userId, isActive: true },
        { isActive: false }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      throw error;
    }
  }

  /**
   * Get roadmap statistics for a user
   */
  static async getRoadmapStatistics(userId: string): Promise<{
    totalRoadmaps: number;
    activeRoadmaps: number;
    completedRoadmaps: number;
    totalMilestones: number;
    completedMilestones: number;
    overdueMilestones: number;
    upcomingMilestones: number;
  }> {
    try {
      const [activeRoadmaps, completedRoadmaps] = await Promise.all([
        FarmingRoadmap.find({ userId, isActive: true, currentStage: { $ne: 'completed' } }),
        FarmingRoadmap.find({ userId, currentStage: 'completed' })
      ]);

      const allRoadmaps = [...activeRoadmaps, ...completedRoadmaps];
      
      let totalMilestones = 0;
      let completedMilestones = 0;
      let overdueMilestones = 0;
      let upcomingMilestones = 0;

      const today = new Date();
      const nextWeek = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));

      allRoadmaps.forEach(roadmap => {
        totalMilestones += roadmap.milestones.length;
        
        roadmap.milestones.forEach(milestone => {
          if (milestone.status === 'completed') {
            completedMilestones++;
          } else if (milestone.status === 'pending') {
            const schedDate = new Date(milestone.scheduledDate);
            if (schedDate < today) {
              overdueMilestones++;
            } else if (schedDate <= nextWeek) {
              upcomingMilestones++;
            }
          }
        });
      });

      return {
        totalRoadmaps: allRoadmaps.length,
        activeRoadmaps: activeRoadmaps.length,
        completedRoadmaps: completedRoadmaps.length,
        totalMilestones,
        completedMilestones,
        overdueMilestones,
        upcomingMilestones
      };
    } catch (error) {
      console.error('Error getting roadmap statistics:', error);
      throw error;
    }
  }
}