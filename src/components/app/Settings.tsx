import { cssColor } from '@/lib/colors';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
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
  RefreshCw as RefreshIcon
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
    const response = await authenticatedFetch(`/api/getUserSettings`);
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

      const response = await authenticatedFetch('/api/updateUserSettings', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ userEmail: user?.email, settings: newSettings }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to update settings');
      }
      return response.json();
    },
    {
      onSuccess: () => {
        const keyInput = document.getElementById('apiKey') as HTMLInputElement | null;
        if (keyInput) keyInput.value = '';
        queryClient.invalidateQueries(['userSettings', user?.email]);
        showToast(
          <>
            <span
              className="inline-block mr-2 bg-status-success rounded-full"
              style={{ width: '10px', height: '10px' }}
            ></span>
            Settings updated
          </>
        );
      },
      onError: (error: Error) => showToast(error.message),
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

    const replacementKey = (document.getElementById('apiKey') as HTMLInputElement)?.value.trim();
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
      overdueWarningThreshold: parseInt(
        (document.getElementById('overdueWarningThreshold') as HTMLInputElement)?.value,
        10
      ),
      // API Settings
      ...(replacementKey ? { apiKey: replacementKey } : {}),
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
      !validateNumber(newSettings.maximumInterval) ||
      !validateNumber(newSettings.overdueWarningThreshold)
    ) {
      showToast("Graduating Interval, Easy Interval, Maximum Interval, and Overdue Warning Threshold must be numbers.");
      return;
    }
    if (
      !validateDecimal(newSettings.startingEase) ||
      !validateDecimal(newSettings.easyBonus) ||
      !validateDecimal(newSettings.intervalModifier)
    ) {
      showToast("Starting Ease, Easy Bonus, and Interval Modifier must be decimal numbers.");
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
        className="w-full px-3 py-2 bg-background border border-border-subtle/70 rounded-md shadow-sm outline-none focus:outline-none focus:border-app-action-start/70 focus:ring-1 focus:ring-app-action-end/50 transition-all duration-200 text-foreground h-11"
        style={{ outline: 'none' }}
      />
      <div className="absolute inset-0 rounded-md border border-app-action-end/0 group-focus-within:border-app-action-end/30 pointer-events-none transition-all duration-300 shadow-[0_0_0_0_rgb(var(--app-action-end)/0)] group-focus-within:shadow-[0_0_10px_1px_rgb(var(--app-action-end)/0.2)]"></div>
    </div>
  );

  if (error) {
    return <div className="text-status-danger-soft">Error: {(error as Error).message}</div>;
  }
  if (isLoading || !data) {
    return (
        <div className="flex justify-center items-center h-[60vh]">
          <div className="relative flex flex-col items-center">
            {/* Outer glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-app-action-start to-app-action-end blur-xl opacity-20 animate-pulse"></div>
            
            {/* Spinner container */}
            <div className="relative">
              {/* Gradient ring */}
              <div className="w-16 h-16 rounded-full border-2 border-transparent 
                             bg-gradient-to-r from-app-action-start to-app-action-end opacity-20"></div>
              
              {/* Spinning gradient arc */}
              <div className="absolute top-0 left-0 w-16 h-16 border-2 border-transparent 
                             rounded-full animate-spin duration-1000" 
                   style={{
                     borderTopColor: cssColor('app-action-start'),
                     borderRightColor: cssColor('app-action-end'),
                     animationDuration: '1s'
                   }}>
              </div>
              
              {/* Inner circle with logo or icon */}
              
            </div>
            
            {/* Loading text with shimmer effect */}
            <div className="mt-4 text-sm font-medium text-muted-foreground relative overflow-hidden">
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
        <div className="bg-surface border-border rounded-xl border p-6 shadow-lg space-y-6">
          <div className="flex items-center mb-4">
            <BrainIcon className="w-5 h-5 mr-2" style={{ color: cssColor('app-action-end') }} />
            <h2 className="text-lg font-medium text-foreground">New Cards</h2>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="learnSteps" className="block text-sm font-medium text-muted-foreground">
                Learning Steps
              </label>
              <StyledInput id="learnSteps" defaultValue={data.learnSteps} />
              <p className="text-xs text-placeholder">
                One or more delays, separated by spaces. Example: &apos;10m 3d&apos;.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="graduatingInterval" className="block text-sm font-medium text-muted-foreground">
                Graduating Interval
              </label>
              <StyledInput id="graduatingInterval" defaultValue={data.graduatingInterval} />
              <p className="text-xs text-placeholder">
                Days to wait after the final learning step.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="easyInterval" className="block text-sm font-medium text-muted-foreground">
                Easy Interval
              </label>
              <StyledInput id="easyInterval" defaultValue={data.easyInterval} />
              <p className="text-xs text-placeholder">
                Days to wait if you press Easy.
              </p>
            </div>
          </div>
        </div>

        {/* Lapses Section */}
        <div className="bg-surface border-border rounded-xl border p-6 shadow-lg space-y-6">
          <div className="flex items-center mb-4">
            <RefreshIcon className="w-5 h-5 mr-2" style={{ color: cssColor('settings-lapses') }} />
            <h2 className="text-lg font-medium text-foreground">Lapses</h2>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="relearnSteps" className="block text-sm font-medium text-muted-foreground">
                Relearning Steps
              </label>
              <StyledInput id="relearnSteps" defaultValue={data.relearnSteps} />
              <p className="text-xs text-placeholder">
                Steps for a problem after pressing Again.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="relearnGraduatingInterval" className="block text-sm font-medium text-muted-foreground">
                New Interval
              </label>
              <StyledInput id="relearnGraduatingInterval" defaultValue={data.relearnGraduatingInterval} />
              <p className="text-xs text-placeholder">
                Multiplier when answering Again on a review problem.
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Section */}
        <div className="bg-surface border-border rounded-xl border p-6 shadow-lg space-y-6">
          <div className="flex items-center mb-4">
            <CogIcon className="w-5 h-5 mr-2" style={{ color: cssColor('settings-advanced') }} />
            <h2 className="text-lg font-medium text-foreground">Advanced</h2>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="maximumInterval" className="block text-sm font-medium text-muted-foreground">
                Maximum Interval
              </label>
              <StyledInput id="maximumInterval" defaultValue={data.maximumInterval} />
              <p className="text-xs text-placeholder">
                Maximum days a review problem can be scheduled.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="startingEase" className="block text-sm font-medium text-muted-foreground">
                Starting Ease
              </label>
              <StyledInput id="startingEase" defaultValue={data.startingEase} />
              <p className="text-xs text-placeholder">
                Default ease multiplier new problems start with.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="easyBonus" className="block text-sm font-medium text-muted-foreground">
                Easy Bonus
              </label>
              <StyledInput id="easyBonus" defaultValue={data.easyBonus} />
              <p className="text-xs text-placeholder">
                Extra multiplier when rating Easy.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="intervalModifier" className="block text-sm font-medium text-muted-foreground">
                Interval Modifier
              </label>
              <StyledInput id="intervalModifier" defaultValue={data.intervalModifier} />
              <p className="text-xs text-placeholder">
                A multiplier to adjust algorithm aggressiveness.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="overdueWarningThreshold" className="block text-sm font-medium text-muted-foreground">
                Overdue Warning Threshold (months)
              </label>
              <StyledInput id="overdueWarningThreshold" defaultValue={data.overdueWarningThreshold} />
              <p className="text-xs text-placeholder">
                Problems overdue by this many months will show a lapse warning in Study Mode
              </p>
            </div>
          </div>
        </div>

        {/* API Settings Section */}
        <div className="bg-surface border-border rounded-xl border p-6 shadow-lg space-y-6">
          <div className="flex items-center mb-4">
            <KeyIcon className="w-5 h-5 mr-2" style={{ color: cssColor('settings-api') }} />
            <h2 className="text-lg font-medium text-foreground">API Settings</h2>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground">
                OpenAI API Key
              </label>
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-app-action-start/10 to-app-action-end/10" />
                <div className="relative flex rounded-lg overflow-hidden transition-colors border border-border-subtle/70 group">
                  <span className="inline-flex items-center px-4 border-r border-border bg-background/50 text-placeholder">
                    <KeyIcon className="w-4 h-4" />
                  </span>
                  <input
                    type={isApiKeyVisible ? "text" : "password"}
                    id="apiKey"
                    defaultValue=""
                    placeholder={data.hasApiKey ? 'Saved key — enter a replacement' : 'Enter your OpenAI API key'}
                    autoComplete="off"
                    className="flex-1 px-4 py-2.5 bg-surface-field text-foreground focus:outline-none focus:border-app-action-start/70 focus:ring-1 focus:ring-app-action-end/50 transition-all duration-200 h-11"
                    style={{ outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={toggleApiKeyVisibility}
                    className="px-3 text-placeholder hover:text-foreground transition-colors"
                  >
                    {isApiKeyVisible ? 'Hide' : 'Show'}
                  </button>
                  <div className="absolute inset-0 rounded-lg border border-app-action-end/0 group-focus-within:border-app-action-end/30 pointer-events-none transition-all duration-300 shadow-[0_0_0_0_rgb(var(--app-action-end)/0)] group-focus-within:shadow-[0_0_10px_1px_rgb(var(--app-action-end)/0.2)]"></div>
                </div>
              </div>
              <p className="text-xs text-placeholder">
                {data.hasApiKey
                  ? 'A key is saved. Leave this field blank to keep it.'
                  : 'Enter your OpenAI API key to enable AI-based features.'}
              </p>
              {data.hasApiKey && (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setIsSaving(true);
                    updateSettingsMutation.mutate({ apiKey: null });
                  }}
                  className="text-xs text-status-error hover:underline disabled:opacity-50"
                >
                  Remove saved key
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 bg-surface border-border rounded-xl border p-4 shadow-lg flex justify-between items-center">
        {lastSaved ? (
          <span className="text-sm text-placeholder">
            Saved
          </span>
        ) : (
          <span className="text-sm text-placeholder">
            Not yet saved
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            flex items-center px-4 py-2 rounded-lg shadow-lg transition-all duration-200 text-foreground
            ${isSaving 
              ? 'bg-app-action-end/50 cursor-not-allowed'
              : 'bg-gradient-to-r from-app-action-start to-app-action-end hover:from-app-action-hover-start hover:to-app-action-hover-end cursor-pointer'}
          `}
        >
          {isSaving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 rounded-full mr-2 border-2 border-foreground/30 border-t-foreground"
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
