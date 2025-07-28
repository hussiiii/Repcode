import { useState, useContext, useEffect } from 'react';
import { auth } from '../../firebaseConfig';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { AuthContext } from '@/auth/AuthContext';
import Toast from './Toast';
import {
  Save as SaveIcon,
  Loader2 as SpinnerIcon,
  Key as KeyIcon, 
  Cog as CogIcon, 
  Brain as BrainIcon, 
  RefreshCw as RefreshIcon,
  Globe as GlobeIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const fetchUserSettings = async () => {
    if (!user) throw new Error('No user found');
    const response = await fetch(`/api/getUserSettings?userEmail=${user.email}`);
    if (!response.ok) throw new Error('Failed to fetch user settings');
    return response.json();
  };

  const { isLoading, data, error } = useQuery(
    ['userSettings', user?.email],
    fetchUserSettings,
    { enabled: !!user }
  );

  const updateSettingsMutation = useMutation(
    async (newSettings: any) => {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Authentication token is not available.');

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch('/api/updateUserSettings', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ userEmail: user?.email, settings: newSettings }),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['userSettings', user?.email]);
        showToast(
          <>
            <span
              className="inline-block mr-2 bg-success rounded-full"
              style={{ width: '10px', height: '10px' }}
            ></span>
            Settings updated
          </>
        );
      },
      onSettled: () => setIsSaving(false),
    }
  );

  useEffect(() => {
    if (updateSettingsMutation.isSuccess) setLastSaved(new Date());
  }, [updateSettingsMutation.isSuccess]);

  const showToast = (message: any) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };

  const toggleApiKeyVisibility = () => {
    setIsApiKeyVisible(!isApiKeyVisible);
  };

  const handleSave = () => {
    if (!data) return;

    const newSettings = {
      // New Cards
      learnSteps: (document.getElementById('learnSteps') as HTMLInputElement)?.value,
      graduatingInterval: parseInt(
        (document.getElementById('graduatingInterval') as HTMLInputElement)?.value,
        10
      ),
      easyInterval: parseInt(
        (document.getElementById('easyInterval') as HTMLInputElement)?.value,
        10
      ),
      // Lapses
      relearnSteps: (document.getElementById('relearnSteps') as HTMLInputElement)?.value,
      relearnGraduatingInterval: parseFloat(
        (document.getElementById('relearnGraduatingInterval') as HTMLInputElement)?.value
      ),
      // Advanced
      maximumInterval: parseInt(
        (document.getElementById('maximumInterval') as HTMLInputElement)?.value,
        10
      ),
      startingEase: parseFloat(
        (document.getElementById('startingEase') as HTMLInputElement)?.value
      ),
      easyBonus: parseFloat(
        (document.getElementById('easyBonus') as HTMLInputElement)?.value
      ),
      intervalModifier: parseFloat(
        (document.getElementById('intervalModifier') as HTMLInputElement)?.value
      ),
      // API Settings
      apiKey: (document.getElementById('apiKey') as HTMLInputElement)?.value,
      // LLM API Settings
      baseUrl: (document.getElementById('baseUrl') as HTMLInputElement)?.value,
      llmApiKey: (document.getElementById('llmApiKey') as HTMLInputElement)?.value,
      llmModel: (document.getElementById('llmModel') as HTMLInputElement)?.value,
      llmTemperature: parseFloat(
        (document.getElementById('llmTemperature') as HTMLInputElement)?.value
      ),
      llmTopP: parseFloat(
        (document.getElementById('llmTopP') as HTMLInputElement)?.value
      ),
    };

    // Validations (same as before)
    if (
      !validateSteps(newSettings.learnSteps) ||
      !validateSteps(newSettings.relearnSteps)
    ) {
      showToast("Learning Steps and Relearning Steps must be in the format: number[m or d]. Example: &apos;10m 3d&apos;.");
      return;
    }
    if (
      !validateNumber(newSettings.graduatingInterval) ||
      !validateNumber(newSettings.easyInterval) ||
      !validateNumber(newSettings.maximumInterval)
    ) {
      showToast("Graduating Interval, Easy Interval, and Maximum Interval must be numbers.");
      return;
    }
    if (
      !validateDecimal(newSettings.startingEase) ||
      !validateDecimal(newSettings.easyBonus) ||
      !validateDecimal(newSettings.intervalModifier) ||
      isNaN(newSettings.llmTemperature) ||
      isNaN(newSettings.llmTopP)
    ) {
      showToast("Starting Ease, Easy Bonus, Interval Modifier, LLM Temperature, and LLM Top P must be valid numbers.");
      return;
    }

    setIsSaving(true);
    updateSettingsMutation.mutate(newSettings);
  };

  const validateSteps = (value: any) =>
    /^[0-9]+[md](\s+[0-9]+[md])*$/i.test(value);
  const validateNumber = (value: any) => /^\d+$/.test(value);
  const validateDecimal = (value: any) => /^\d+(\.\d+)?$/.test(value);

  // Create a reusable input field component with the same styling as CollectionModal
  const StyledInput = ({ id, defaultValue, type = "text" }: { id: string, defaultValue: any, type?: string }) => (
    <div className="relative group">
      <input
        type={type}
        id={id}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 bg-[#2A303C] border border-[#3A4150]/70 rounded-md shadow-sm outline-none focus:outline-none focus:border-[#06b6d4]/70 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all duration-200 text-primary h-11"
        style={{ outline: 'none' }}
      />
      <div className="absolute inset-0 rounded-md border border-[#3b82f6]/0 group-focus-within:border-[#3b82f6]/30 pointer-events-none transition-all duration-300 shadow-[0_0_0_0_rgba(59,130,246,0)] group-focus-within:shadow-[0_0_10px_1px_rgba(59,130,246,0.2)]"></div>
    </div>
  );

  if (error) {
    return <div className="text-[#f87171]">Error: {(error as Error).message}</div>;
  }
  if (isLoading || !data) {
    return (
        <div className="flex justify-center items-center h-[60vh]">
          <div className="relative flex flex-col items-center">
            {/* Outer glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] blur-xl opacity-20 animate-pulse"></div>
            
            {/* Spinner container */}
            <div className="relative">
              {/* Gradient ring */}
              <div className="w-16 h-16 rounded-full border-2 border-transparent 
                             bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] opacity-20"></div>
              
              {/* Spinning gradient arc */}
              <div className="absolute top-0 left-0 w-16 h-16 border-2 border-transparent 
                             rounded-full animate-spin duration-1000" 
                   style={{
                     borderTopColor: '#06b6d4',
                     borderRightColor: '#3b82f6',
                     animationDuration: '1s'
                   }}>
              </div>
              
              {/* Inner circle with logo or icon */}
              
            </div>
            
            {/* Loading text with shimmer effect */}
            <div className="mt-4 text-sm font-medium text-[#B0B7C3] relative overflow-hidden">
              <span>Loading</span>
              <span className="inline-flex overflow-hidden ml-1">
                <span className="animate-ellipsis">.</span>
                <span className="animate-ellipsis animation-delay-300">.</span>
                <span className="animate-ellipsis animation-delay-600">.</span>
              </span>
            </div>
          </div>
        </div>
      );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New Cards Section */}
        <div className="bg-[#343B4A] border-[#3A4253] rounded-xl border p-6 shadow-lg space-y-6">
          <div className="flex items-center mb-4">
            <BrainIcon className="w-5 h-5 mr-2" style={{ color: '#3b82f6' }} />
            <h2 className="text-lg font-medium text-[#ffffff]">New Cards</h2>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="learnSteps" className="block text-sm font-medium text-[#B0B7C3]">
                Learning Steps
              </label>
              <StyledInput id="learnSteps" defaultValue={data.learnSteps} />
              <p className="text-xs text-[#8A94A6]">
                One or more delays, separated by spaces. Example: &apos;10m 3d&apos;.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="graduatingInterval" className="block text-sm font-medium text-[#B0B7C3]">
                Graduating Interval
              </label>
              <StyledInput id="graduatingInterval" defaultValue={data.graduatingInterval} />
              <p className="text-xs text-[#8A94A6]">
                Days to wait after the final learning step.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="easyInterval" className="block text-sm font-medium text-[#B0B7C3]">
                Easy Interval
              </label>
              <StyledInput id="easyInterval" defaultValue={data.easyInterval} />
              <p className="text-xs text-[#8A94A6]">
                Days to wait if you press Easy.
              </p>
            </div>
          </div>
        </div>

        {/* Lapses Section */}
        <div className="bg-[#343B4A] border-[#3A4253] rounded-xl border p-6 shadow-lg space-y-6">
          <div className="flex items-center mb-4">
            <RefreshIcon className="w-5 h-5 mr-2" style={{ color: '#f59e0b' }} />
            <h2 className="text-lg font-medium text-[#ffffff]">Lapses</h2>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="relearnSteps" className="block text-sm font-medium text-[#B0B7C3]">
                Relearning Steps
              </label>
              <StyledInput id="relearnSteps" defaultValue={data.relearnSteps} />
              <p className="text-xs text-[#8A94A6]">
                Steps for a problem after pressing Again.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="relearnGraduatingInterval" className="block text-sm font-medium text-[#B0B7C3]">
                New Interval
              </label>
              <StyledInput id="relearnGraduatingInterval" defaultValue={data.relearnGraduatingInterval} />
              <p className="text-xs text-[#8A94A6]">
                Multiplier when answering Again on a review problem.
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Section */}
        <div className="bg-[#343B4A] border-[#3A4253] rounded-xl border p-6 shadow-lg space-y-6">
          <div className="flex items-center mb-4">
            <CogIcon className="w-5 h-5 mr-2" style={{ color: '#10b981' }} />
            <h2 className="text-lg font-medium text-[#ffffff]">Advanced</h2>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="maximumInterval" className="block text-sm font-medium text-[#B0B7C3]">
                Maximum Interval
              </label>
              <StyledInput id="maximumInterval" defaultValue={data.maximumInterval} />
              <p className="text-xs text-[#8A94A6]">
                Maximum days a review problem can be scheduled.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="startingEase" className="block text-sm font-medium text-[#B0B7C3]">
                Starting Ease
              </label>
              <StyledInput id="startingEase" defaultValue={data.startingEase} />
              <p className="text-xs text-[#8A94A6]">
                Default ease multiplier new problems start with.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="easyBonus" className="block text-sm font-medium text-[#B0B7C3]">
                Easy Bonus
              </label>
              <StyledInput id="easyBonus" defaultValue={data.easyBonus} />
              <p className="text-xs text-[#8A94A6]">
                Extra multiplier when rating Easy.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="intervalModifier" className="block text-sm font-medium text-[#B0B7C3]">
                Interval Modifier
              </label>
              <StyledInput id="intervalModifier" defaultValue={data.intervalModifier} />
              <p className="text-xs text-[#8A94A6]">
                A multiplier to adjust algorithm aggressiveness.
              </p>
            </div>
          </div>
        </div>

        {/* API Settings Section */}
        <div className="bg-[#343B4A] border-[#3A4253] rounded-xl border p-6 shadow-lg space-y-6">
          <div className="flex items-center mb-4">
            <KeyIcon className="w-5 h-5 mr-2" style={{ color: '#8b5cf6' }} />
            <h2 className="text-lg font-medium text-[#ffffff]">API Settings</h2>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#B0B7C3]">
                OpenAI API Key
              </label>
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[rgba(6,182,212,0.1)] to-[rgba(59,130,246,0.1)]" />
                <div className="relative flex rounded-lg overflow-hidden transition-colors border border-[#3A4150]/70 group">
                  <span className="inline-flex items-center px-4 border-r border-[#3A4253] bg-[rgba(42,48,60,0.5)] text-[#8A94A6]">
                    <KeyIcon className="w-4 h-4" />
                  </span>
                  <input
                    type={isApiKeyVisible ? "text" : "password"}
                    id="apiKey"
                    defaultValue={data.apiKey}
                    className="flex-1 px-4 py-2.5 bg-[#1E232C] text-[#ffffff] focus:outline-none focus:border-[#06b6d4]/70 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all duration-200 h-11"
                    style={{ outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={toggleApiKeyVisibility}
                    className="px-3 text-[#8A94A6] hover:text-[#ffffff] transition-colors"
                  >
                    {isApiKeyVisible ? 'Hide' : 'Show'}
                  </button>
                  <div className="absolute inset-0 rounded-lg border border-[#3b82f6]/0 group-focus-within:border-[#3b82f6]/30 pointer-events-none transition-all duration-300 shadow-[0_0_0_0_rgba(59,130,246,0)] group-focus-within:shadow-[0_0_10px_1px_rgba(59,130,246,0.2)]"></div>
                </div>
              </div>
              <p className="text-xs text-[#8A94A6]">
                Enter your OpenAI API key to enable AI-based features.
              </p>
            </div>

            {/* New LLM API Settings Fields */}
            <div className="border-t border-[#3A4150] pt-4 mt-4">
              <div className="flex items-center mb-4">
                <GlobeIcon className="w-5 h-5 mr-2" style={{ color: '#4f46e5' }} />
                <h2 className="text-lg font-medium text-[#ffffff]">LLM API Settings</h2>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="baseUrl" className="block text-sm font-medium text-[#B0B7C3]">
                    API Endpoint URL
                  </label>
                  <StyledInput id="baseUrl" defaultValue={data.baseUrl} />
                  <p className="text-xs text-[#8A94A6]">
                    The base URL for the LLM API (e.g., https://api.openai.com/v1)
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="llmApiKey" className="block text-sm font-medium text-[#B0B7C3]">
                    LLM API Key
                  </label>
                  <StyledInput id="llmApiKey" defaultValue={data.llmApiKey} />
                  <p className="text-xs text-[#8A94A6]">
                    Your API key for the LLM service.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="llmModel" className="block text-sm font-medium text-[#B0B7C3]">
                    LLM Model
                  </label>
                  <StyledInput id="llmModel" defaultValue={data.llmModel} />
                  <p className="text-xs text-[#8A94A6]">
                    The model of the LLM to use.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="llmTemperature" className="block text-sm font-medium text-[#B0B7C3]">
                    LLM Temperature
                  </label>
                  <StyledInput id="llmTemperature" defaultValue={data.llmTemperature} type="number" />
                  <p className="text-xs text-[#8A94A6]">
                    Controls the randomness of the output. Higher values mean more randomness.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="llmTopP" className="block text-sm font-medium text-[#B0B7C3]">
                    LLM Top P
                  </label>
                  <StyledInput id="llmTopP" defaultValue={data.llmTopP} type="number" />
                  <p className="text-xs text-[#8A94A6]">
                    Controls the diversity of the output. 0.9 means only the top 90% most likely tokens are considered.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 bg-[#343B4A] border-[#3A4253] rounded-xl border p-4 shadow-lg flex justify-between items-center">
        {lastSaved ? (
          <span className="text-sm text-[#8A94A6]">
            Saved
          </span>
        ) : (
          <span className="text-sm text-[#8A94A6]">
            Not yet saved
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            flex items-center px-4 py-2 rounded-lg shadow-lg transition-all duration-200 text-[#ffffff]
            ${isSaving 
              ? 'bg-[rgba(59,130,246,0.5)] cursor-not-allowed' 
              : 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] hover:from-[#0891b2] hover:to-[#2563eb] cursor-pointer'}
          `}
        >
          {isSaving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 rounded-full mr-2 border-2 border-[rgba(255,255,255,0.3)] border-t-[#ffffff]"
              />
              Saving...
            </>
          ) : (
            <>
              <SaveIcon className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <Toast message={toastMessage} isVisible={isToastVisible} />
    </>
  );
};

export default Settings;
