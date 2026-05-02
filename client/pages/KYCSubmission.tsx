import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Loader2,
  Fingerprint
} from "lucide-react";
import { KYCSubmissionRequest, ApiResponse, KYCRecord } from "@shared/api";
import { ZKProofVerifier } from "../components/ZKProofVerifier";

export default function KYCSubmission() {
  const [searchParams] = useSearchParams();
  const previousKycId = searchParams.get("update");
  const isUpdateMode = !!previousKycId;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedRecord, setSubmittedRecord] = useState<KYCRecord | null>(
    null,
  );

  useEffect(() => {
    if (isUpdateMode) {
      console.log(`🔄 Update mode: Resubmitting KYC for previous ID: ${previousKycId}`);
    }
  }, [isUpdateMode, previousKycId]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pan: "",
    dateOfBirth: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
  });

  const [zkProofs, setZkProofs] = useState({
    age: false,
    pan: false,
    ageHash: "",
    panHash: ""
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return (
          formData.name &&
          formData.email &&
          formData.phone &&
          formData.pan &&
          /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan) &&
          formData.dateOfBirth
        );
      case 2:
        return (
          formData.address.street &&
          formData.address.city &&
          formData.address.state &&
          formData.address.pincode
        );
      case 3:
        return selectedFiles.length > 0;
      case 4:
        return zkProofs.age && zkProofs.pan;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("data", JSON.stringify({
        ...formData,
        zkProofs: {
          ageHash: zkProofs.ageHash,
          panHash: zkProofs.panHash
        }
      }));
      selectedFiles.forEach((file, index) => {
        formDataToSend.append(`documents`, file);
      });

      // Use update endpoint if in update mode, otherwise use submit
      const endpoint = isUpdateMode 
        ? `/api/kyc/update/${previousKycId}`
        : "/api/kyc/submit";

      const response = await fetch(endpoint, {
        method: "POST",
        body: formDataToSend,
      });

      const result: ApiResponse<KYCRecord> = await response.json();

      if (result.success && result.data) {
        setSubmitSuccess(true);
        setSubmittedRecord(result.data);
      } else {
        // Provide specific error feedback
        let errorMessage = result.message || "Submission failed";

        if (errorMessage.includes("PAN format")) {
          errorMessage =
            "PAN Number format is invalid. Please use format: ABCDE1234F (5 letters + 4 digits + 1 letter)";
        } else if (errorMessage.includes("email")) {
          errorMessage = "Please enter a valid email address";
        } else if (errorMessage.includes("phone")) {
          errorMessage = "Please enter a valid phone number";
        } else if (errorMessage.includes("document")) {
          errorMessage =
            "Please upload at least one valid document (PDF, JPG, PNG)";
        }

        setSubmitError(errorMessage);
      }
    } catch (error) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  if (submitSuccess && submittedRecord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Authen Ledger
                </h1>
                <p className="text-xs text-slate-500">
                  KYC Submission Successful
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Success Content */}
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-green-100 p-6 rounded-full w-fit mx-auto mb-6">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              {isUpdateMode ? "KYC Updated Successfully!" : "KYC Submitted Successfully!"}
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              {isUpdateMode 
                ? "Your KYC has been resubmitted with a new blockchain record. Previous record is preserved."
                : "Your KYC application has been submitted and is being processed on the blockchain."}
            </p>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg text-left mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Submission Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">KYC ID</p>
                    <p className="font-mono text-sm font-semibold">
                      {submittedRecord.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Status</p>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {submittedRecord.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Submitted At</p>
                    <p className="text-sm">
                      {new Date(submittedRecord.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Verification Level</p>
                    <Badge variant="outline">
                      {submittedRecord.verificationLevel}
                    </Badge>
                  </div>
                </div>
                {isUpdateMode && (submittedRecord as any).previousKycId && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600 font-semibold mb-1">Previous KYC ID</p>
                    <p className="font-mono text-sm">{(submittedRecord as any).previousKycId}</p>
                    <p className="text-xs text-slate-500 mt-2">Previous block remains on blockchain • New block created with new KYC ID</p>
                  </div>
                )}
                {submittedRecord.blockchainTxHash && (
                  <div>
                    <p className="text-sm text-slate-500">
                      Blockchain Transaction Hash
                    </p>
                    <p className="font-mono text-xs break-all bg-slate-50 p-2 rounded">
                      {submittedRecord.blockchainTxHash}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Unique hash for this block • Search by this hash to verify</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={`/verify?id=${submittedRecord.id}`}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Check Status
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="lg">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Authen Ledger
                </h1>
                <p className="text-xs text-slate-500">
                  Submit Your KYC Documents
                </p>
              </div>
            </div>
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {isUpdateMode && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200 py-3">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <p className="text-sm text-orange-800 font-semibold">
                Update Mode: Resubmitting KYC
              </p>
              <span className="text-xs text-slate-600 font-mono">(Previous: {previousKycId})</span>
              <span className="text-xs text-slate-500 ml-2">• New KYC ID & Block will be created</span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-slate-200/50 py-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-slate-800">
              KYC Submission Process
            </h2>
            <span className="text-sm text-slate-600">
              Step {currentStep} of 5
            </span>
          </div>
          <Progress value={(currentStep / 5) * 100} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span
              className={currentStep >= 1 ? "text-blue-600 font-medium" : ""}
            >
              Personal Info
            </span>
            <span
              className={currentStep >= 2 ? "text-blue-600 font-medium" : ""}
            >
              Address
            </span>
            <span
              className={currentStep >= 3 ? "text-blue-600 font-medium" : ""}
            >
              Documents
            </span>
            <span
              className={currentStep >= 4 ? "text-blue-600 font-medium" : ""}
            >
              ZK Proof
            </span>
            <span
              className={currentStep >= 5 ? "text-blue-600 font-medium" : ""}
            >
              Review
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {submitError && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {submitError}
              </AlertDescription>
            </Alert>
          )}

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pan">PAN Number *</Label>
                    <Input
                      id="pan"
                      value={formData.pan}
                      onChange={(e) =>
                        handleInputChange("pan", e.target.value.toUpperCase())
                      }
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      className={
                        formData.pan &&
                        !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)
                          ? "border-red-300 focus:border-red-500"
                          : ""
                      }
                    />
                    {formData.pan &&
                      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan) && (
                        <p className="text-xs text-red-600 mt-1">
                          PAN must be 10 characters: 5 letters + 4 digits + 1
                          letter (e.g., ABCDE1234F)
                        </p>
                      )}
                    {!formData.pan && (
                      <p className="text-xs text-slate-500 mt-1">
                        Format: 5 letters + 4 digits + 1 letter (e.g.,
                        ABCDE1234F)
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Address Information */}
          {currentStep === 2 && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Textarea
                    id="street"
                    value={formData.address.street}
                    onChange={(e) =>
                      handleInputChange("address.street", e.target.value)
                    }
                    placeholder="Enter your complete street address"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) =>
                        handleInputChange("address.city", e.target.value)
                      }
                      placeholder="Enter your city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) =>
                        handleInputChange("address.state", e.target.value)
                      }
                      placeholder="Enter your state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">PIN Code *</Label>
                    <Input
                      id="pincode"
                      value={formData.address.pincode}
                      onChange={(e) =>
                        handleInputChange("address.pincode", e.target.value)
                      }
                      placeholder="Enter PIN code"
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select
                      value={formData.address.country}
                      onValueChange={(value) =>
                        handleInputChange("address.country", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="USA">United States</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Document Upload */}
          {currentStep === 3 && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Upload Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-700 mb-2">
                    Upload Identity Documents
                  </h3>
                  <p className="text-slate-500 mb-4">
                    Upload PAN Card, Aadhaar, Passport, or other identity
                    documents
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload">
                    <Button asChild>
                      <span>Select Files</span>
                    </Button>
                  </Label>
                  <p className="text-xs text-slate-400 mt-2">
                    Supported formats: PDF, JPG, PNG (Max 5MB each)
                  </p>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-700">
                      Selected Files:
                    </h4>
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-slate-50 p-3 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {file.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Zero-Knowledge Verification */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <ZKProofVerifier 
                onProofGenerated={(type, hash, isValid) => {
                  setZkProofs(prev => ({
                    ...prev,
                    [type]: isValid,
                    [`${type}Hash`]: hash
                  }));
                }} 
              />
              {(!zkProofs.age || !zkProofs.pan) && (
                <Alert className="border-indigo-200 bg-indigo-50">
                  <AlertTriangle className="h-4 w-4 text-indigo-600" />
                  <AlertDescription className="text-indigo-800">
                    Please generate and verify both Age and PAN proofs to proceed to the next step.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  Review & Submit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-slate-700 mb-3">
                      Personal Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-slate-500">Name:</span>{" "}
                        {formData.name}
                      </p>
                      <p>
                        <span className="text-slate-500">Email:</span>{" "}
                        {formData.email}
                      </p>
                      <p>
                        <span className="text-slate-500">Phone:</span>{" "}
                        {formData.phone}
                      </p>
                      <p>
                        <span className="text-slate-500">PAN:</span>{" "}
                        {formData.pan}
                      </p>
                      <p>
                        <span className="text-slate-500">DOB:</span>{" "}
                        {formData.dateOfBirth}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-700 mb-3">Address</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-slate-500">Street:</span>{" "}
                        {formData.address.street}
                      </p>
                      <p>
                        <span className="text-slate-500">City:</span>{" "}
                        {formData.address.city}
                      </p>
                      <p>
                        <span className="text-slate-500">State:</span>{" "}
                        {formData.address.state}
                      </p>
                      <p>
                        <span className="text-slate-500">PIN:</span>{" "}
                        {formData.address.pincode}
                      </p>
                      <p>
                        <span className="text-slate-500">Country:</span>{" "}
                        {formData.address.country}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-700 mb-3">
                    Documents ({selectedFiles.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Your documents will be encrypted and stored securely.
                    Document hashes will be recorded on the blockchain for
                    immutable verification.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="px-6"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit KYC
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
