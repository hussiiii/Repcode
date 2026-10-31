import { Heading } from '@/components/ui/typography';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';
import { Input } from '@/components/ui/input';
import { FieldLabel, Field, FieldDescription } from '@/components/ui/field';
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { cssColor } from '@/lib/colors';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import { useState, useContext, useEffect } from 'react';
import { auth } from '../../firebaseConfig';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { AuthContext } from '@/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';
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
  const { toast: showToast } = useToast(3000);
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
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


  if (error) {
    return <div className="text-status-danger-soft">Error: {(error as Error).message}</div>;
  }
  if (isLoading || !data) {
    return (
        <div className="flex justify-center items-center h-[60vh]">
          <LoadingState />
        </div>
      );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New Cards Section */}
        <Card padding="xl" className="space-y-6">
          <div className="flex items-center mb-4">
            <BrainIcon className="w-5 h-5 mr-2" style={{ color: cssColor('app-action-end') }} />
            <Heading as="h2" size="lg" weight="medium" tone="foreground">New Cards</Heading>
          </div>
          
          <div className="space-y-5">
            <Field controlId="learnSteps" spacing="normal" >
              <FieldLabel variant="settings" htmlFor="learnSteps" >
                Learning Steps
              </FieldLabel>
              <InputGroup variant="glow"><Input variant="settings" className="w-full" id="learnSteps" defaultValue={data.learnSteps} /></InputGroup>
              <FieldDescription >
                One or more delays, separated by spaces. Example: &apos;10m 3d&apos;.
              </FieldDescription>
            </Field>
            
            <Field controlId="graduatingInterval" spacing="normal" >
              <FieldLabel variant="settings" htmlFor="graduatingInterval" >
                Graduating Interval
              </FieldLabel>
              <InputGroup variant="glow"><Input variant="settings" className="w-full" id="graduatingInterval" defaultValue={data.graduatingInterval} /></InputGroup>
              <FieldDescription >
                Days to wait after the final learning step.
              </FieldDescription>
            </Field>
            
            <Field controlId="easyInterval" spacing="normal" >
              <FieldLabel variant="settings" htmlFor="easyInterval" >
                Easy Interval
              </FieldLabel>
              <InputGroup variant="glow"><Input variant="settings" className="w-full" id="easyInterval" defaultValue={data.easyInterval} /></InputGroup>
              <FieldDescription >
                Days to wait if you press Easy.
              </FieldDescription>
            </Field>
          </div>
        </Card>

        {/* Lapses Section */}
        <Card padding="xl" className="space-y-6">
          <div className="flex items-center mb-4">
            <RefreshIcon className="w-5 h-5 mr-2" style={{ color: cssColor('settings-lapses') }} />
            <Heading as="h2" size="lg" weight="medium" tone="foreground">Lapses</Heading>
          </div>
          
          <div className="space-y-5">
            <Field controlId="relearnSteps" spacing="normal" >
              <FieldLabel variant="settings" htmlFor="relearnSteps" >
                Relearning Steps
              </FieldLabel>
              <InputGroup variant="glow"><Input variant="settings" className="w-full" id="relearnSteps" defaultValue={data.relearnSteps} /></InputGroup>
              <FieldDescription >
                Steps for a problem after pressing Again.
              </FieldDescription>
            </Field>
            
            <Field controlId="relearnGraduatingInterval" spacing="normal" >
              <FieldLabel variant="settings" htmlFor="relearnGraduatingInterval" >
                New Interval
              </FieldLabel>
              <InputGroup variant="glow"><Input variant="settings" className="w-full" id="relearnGraduatingInterval" defaultValue={data.relearnGraduatingInterval} /></InputGroup>
              <FieldDescription >
                Multiplier when answering Again on a review problem.
              </FieldDescription>
            </Field>
          </div>
        </Card>

        {/* Advanced Section */}
        <Card padding="xl" className="space-y-6">
          <div className="flex items-center mb-4">
            <CogIcon className="w-5 h-5 mr-2" style={{ color: cssColor('settings-advanced') }} />
            <Heading as="h2" size="lg" weight="medium" tone="foreground">Advanced</Heading>
          </div>
          
          <div className="space-y-5">
            <Field controlId="maximumInterval" spacing="normal" >
              <FieldLabel variant="settings" htmlFor="maximumInterval" >
                Maximum Interval
              </FieldLabel>
              <InputGroup variant="glow"><Input variant="settings" className="w-full" id="maximumInterval" defaultValue={data.maximumInterval} /></InputGroup>
              <FieldDescription >
                Maximum days a review problem can be scheduled.
              </FieldDescription>
            </Field>
            
            <Field controlId="startingEase" spacing="normal" >
              <FieldLabel variant="settings" htmlFor="startingEase" >
                Starting Ease
              </FieldLabel>
              <InputGroup variant="glow"><Input variant="settings" className="w-full" id="startingEase" defaultValue={data.startingEase} /></InputGroup>
              <FieldDescription >
                Default ease multiplier new problems start with.
              </FieldDescription>
            </Field>
            
            <Field controlId="easyBonus" spacing="normal" >
              <FieldLabel variant="settings" htmlFor="easyBonus" >
                Easy Bonus
              </FieldLabel>
              <InputGroup variant="glow"><Input variant="settings" className="w-full" id="easyBonus" defaultValue={data.easyBonus} /></InputGroup>
              <FieldDescription >
                Extra multiplier when rating Easy.
              </FieldDescription>
            </Field>
            
            <Field controlId="intervalModifier" spacing="normal" >
              <FieldLabel variant="settings" htmlFor="intervalModifier" >
                Interval Modifier
              </FieldLabel>
              <InputGroup variant="glow"><Input variant="settings" className="w-full" id="intervalModifier" defaultValue={data.intervalModifier} /></InputGroup>
              <FieldDescription >
                A multiplier to adjust algorithm aggressiveness.
              </FieldDescription>
            </Field>
            
            <Field controlId="overdueWarningThreshold" spacing="normal" >
              <FieldLabel variant="settings" htmlFor="overdueWarningThreshold" >
                Overdue Warning Threshold (months)
              </FieldLabel>
              <InputGroup variant="glow"><Input variant="settings" className="w-full" id="overdueWarningThreshold" defaultValue={data.overdueWarningThreshold} /></InputGroup>
              <FieldDescription >
                Problems overdue by this many months will show a lapse warning in Study Mode
              </FieldDescription>
            </Field>
          </div>
        </Card>

        {/* API Settings Section */}
        <Card padding="xl" className="space-y-6">
          <div className="flex items-center mb-4">
            <KeyIcon className="w-5 h-5 mr-2" style={{ color: cssColor('settings-api') }} />
            <Heading as="h2" size="lg" weight="medium" tone="foreground">API Settings</Heading>
          </div>
          
          <div className="space-y-5">
            <Field controlId="apiKey" spacing="normal" >
              <FieldLabel variant="settings" >
                OpenAI API Key
              </FieldLabel>
              <InputGroup variant="credential" >


                  <InputGroupAddon >
                    <KeyIcon className="w-4 h-4" />
                  </InputGroupAddon>
                  <Input variant="credential" className="flex-1"
                    type={isApiKeyVisible ? "text" : "password"}
                    id="apiKey"
                    defaultValue=""
                    placeholder={data.hasApiKey ? 'Saved key — enter a replacement' : 'Enter your OpenAI API key'}
                    autoComplete="off"
                  />
                  <Button variant="text" size="fieldAccessory" tone="placeholder" aria-label={isApiKeyVisible ? "Hide API key" : "Show API key"}
                    type="button"
                    onClick={toggleApiKeyVisibility}>
                    {isApiKeyVisible ? 'Hide' : 'Show'}
                  </Button>


              </InputGroup>
              <FieldDescription >
                {data.hasApiKey
                  ? 'A key is saved. Leave this field blank to keep it.'
                  : 'Enter your OpenAI API key to enable AI-based features.'}
              </FieldDescription>
              {data.hasApiKey && (
                <Button variant="bare" tone="remove"
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setIsSaving(true);
                    updateSettingsMutation.mutate({ apiKey: null });
                  }}
                >
                  Remove saved key
                </Button>
              )}
            </Field>
          </div>
        </Card>
      </div>

      {/* Save Button */}
      <Card padding="md" className="mt-6 flex justify-between items-center">
        {lastSaved ? (
          <span className="text-sm text-placeholder">
            Saved
          </span>
        ) : (
          <span className="text-sm text-placeholder">
            Not yet saved
          </span>
        )}
        <Button variant="save" size="action" loading={isSaving}
          onClick={handleSave}
          disabled={isSaving}>
          {isSaving ? (
            <>
              <Spinner variant="save" />
              Saving...
            </>
          ) : (
            <>
              <SaveIcon className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </Card>
    </>
  );
};

export default Settings;
