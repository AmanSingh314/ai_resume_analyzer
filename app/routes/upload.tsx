import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { prepareInstructions } from "~/constants";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

const upload = () => {
  const { fs, auth, isLoading, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setstatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);
    setstatusText("Uploading your resume...");
    const uploadedFile = await fs.upload([file]);

    if (!uploadedFile) {
      setIsProcessing(false);
      setstatusText("Error: Failed to upload the file. Please try again.");
      return;
    }

    const imgFile = await convertPdfToImage(file);

    if (!imgFile.file) {
      setIsProcessing(false);
      setstatusText("Error: Failed to convert PDF to image. Please try again.");
      return;
    }

    setstatusText("Analyzing your resume...");

    const uploadedImage = await fs.upload([imgFile.file]);

    if (!uploadedImage) {
      setIsProcessing(false);
      setstatusText("Error: Failed upload image.");
      return;
    }

    setstatusText("Preparing data...");

    const uuid = generateUUID();
    const data = {
      id: uuid,
      companyName,
      jobTitle,
      jobDescription,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      feedback: "",
    };

    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    setstatusText("Analyzing ...");

    const feedback = await ai.feedback(
      uploadedFile.path,
      prepareInstructions({ jobTitle, jobDescription })
    );

    if (!feedback) {
      setIsProcessing(false);
      setstatusText("Error: Failed to analyze the resume. Please try again.");
      return;
    }

    const feedbackText =
      typeof feedback.message.content === "string"
        ? feedback.message.content
        : feedback.message.content[0].text;

    data.feedback = JSON.parse(feedbackText);
    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setIsProcessing(false);
    setstatusText("Analysis complete, redirecting to results...");
    console.log(data);
    navigate(`/resume/${uuid}`);
  };

  const handleSumbit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    if (!file) {
      return;
    }

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };
  
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full" />
            </>
          ) : (
            <h2>Drop your resume for an ATS acore and improvement tips</h2>
          )}
          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSumbit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  id="company-name"
                  placeholder="Company Name"
                  type="text"
                  name="company-name"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  id="job-title"
                  placeholder="Job Title"
                  type="text"
                  name="job-title"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  id="job-description"
                  placeholder="Job Description"
                  name="job-description"
                />
              </div>
              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>

              <button type="submit" className="primary-button">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default upload;
