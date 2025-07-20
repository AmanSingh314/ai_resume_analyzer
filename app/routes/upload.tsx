import { useState, type FormEvent } from "react";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";

const upload = () => {
    const [isProcessing, setIsProcessing] = useState(false)
    const [statusText, setstatusText] = useState('')
    
    const handleSumbit = (e: FormEvent<HTMLFormElement>) => {
        
    }
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
            <h1>Smart feedback for your dream job</h1>
            {isProcessing? (
                <>
                <h2>{statusText}</h2>
                <img src="/images/resume-scan.gif" className="w-full"/>
                </>
            ): (
                <h2>Drop your resume for an ATS acore and improvement tips</h2>
            )}
            {!isProcessing && (
                <form id="upload-form" onSubmit={handleSumbit} className="flex flex-col gap-4 mt-8">
                    <div className="form-div">
                        <label htmlFor="company-name">Company Name</label>
                        <input id="company-name" placeholder="Company Name" type="text" name="company-name"/>
                    </div>
                    <div className="form-div">
                        <label htmlFor="job-title">Job Title</label>
                        <input id="job-title" placeholder="Job Title" type="text" name="job-title"/>
                    </div>
                    <div className="form-div">
                        <label htmlFor="job-description">Job Description</label>
                        <textarea rows={5} id="job-description" placeholder="Job Description" name="job-description"/>
                    </div>
                    <div className="form-div">
                        <label htmlFor="uploader">Upload Resume</label>
                        <FileUploader/>
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
