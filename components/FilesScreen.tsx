import React from 'react';
import { FileUpload } from "@ark-ui/react/file-upload";
import { DownloadTrigger } from "@ark-ui/react/download-trigger";
import { Upload, Trash2, FileText, Image, File as FileIcon, Download, FileSpreadsheet, FileArchive } from "lucide-react";

const getFileExtension = (filename: string) => {
  const ext = filename.split('.').pop()?.toUpperCase();
  return ext || '-';
};

const getFileIcon = (file: File) => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileType.startsWith('image/')) {
     return <Image className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
  }
  if (fileName.endsWith('.pdf')) {
     return <FileText className="w-5 h-5 text-red-500 dark:text-red-400" />;
  }
  if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx') || fileName.endsWith('.csv')) {
     return <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />;
  }
  if (fileName.endsWith('.zip') || fileName.endsWith('.rar')) {
     return <FileArchive className="w-5 h-5 text-orange-500 dark:text-orange-400" />;
  }
  if (fileName.endsWith('.doc') || fileName.endsWith('.docx') || fileName.endsWith('.rtf')) {
     return <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
  }
  
  return <FileIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
};

export const FilesScreen: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-background-dark p-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-serif text-text-main dark:text-white mb-2">Files</h1>
          <p className="text-text-sub dark:text-gray-400">Manage your campaign documents and assets.</p>
        </header>

        <FileUpload.Root
          maxFiles={10}
          className="flex flex-col gap-8"
          defaultAcceptedFiles={[
            new File(["dummy content"], "code.rtf", { type: "application/rtf" }),
            new File(["dummy content"], "Candace_for_DC_2026_Fundraising_Service_Agreement_UPDATED.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }),
          ]}
        >
          {/* Upload Area */}
          <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center border border-gray-100 dark:border-gray-700 text-gray-400">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-main dark:text-white">Upload Documents</h3>
                <p className="text-sm text-text-sub dark:text-gray-400 mt-0.5">Support for PDF, Images, and Office files.</p>
              </div>
            </div>
            <FileUpload.Trigger className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
              Select Files
            </FileUpload.Trigger>
          </div>

          <FileUpload.Context>
            {({ acceptedFiles }) => (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-text-main dark:text-white">
                  Uploaded Files ({acceptedFiles.length})
                </h3>

                {acceptedFiles.length > 0 ? (
                  <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-subtle transition-colors">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                      <div className="col-span-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </div>
                      <div className="col-span-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </div>
                      <div className="col-span-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Size
                      </div>
                      <div className="col-span-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                        Actions
                      </div>
                    </div>

                    {/* Table Body */}
                    <FileUpload.ItemGroup>
                      {acceptedFiles.map((file, index) => (
                        <FileUpload.Item key={index} file={file} className="group">
                           <div className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50 ${index !== acceptedFiles.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
                            {/* Name Column */}
                            <div className="col-span-6 flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700">
                                {file.type.startsWith('image/') ? (
                                  <FileUpload.ItemPreview type="image/*">
                                    <FileUpload.ItemPreviewImage className="w-full h-full object-cover rounded-lg" />
                                  </FileUpload.ItemPreview>
                                ) : (
                                  getFileIcon(file)
                                )}
                              </div>
                              <div className="min-w-0">
                                <FileUpload.ItemName className="text-sm font-medium text-text-main dark:text-white truncate block" />
                              </div>
                            </div>

                            {/* Type Column */}
                            <div className="col-span-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                {getFileExtension(file.name)}
                              </span>
                            </div>

                            {/* Size Column */}
                            <div className="col-span-2">
                              <FileUpload.ItemSizeText className="text-sm text-text-sub dark:text-gray-400" />
                            </div>

                            {/* Actions Column */}
                            <div className="col-span-2 flex items-center justify-end gap-1">
                              <DownloadTrigger
                                data={file}
                                fileName={file.name}
                                mimeType={file.type}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </DownloadTrigger>
                              <FileUpload.ItemDeleteTrigger className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </FileUpload.ItemDeleteTrigger>
                            </div>
                          </div>
                        </FileUpload.Item>
                      ))}
                    </FileUpload.ItemGroup>
                  </div>
                ) : (
                  <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 mb-4 text-gray-400">
                       <FileText className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-sm text-text-main dark:text-white font-medium">No files uploaded yet</p>
                    <p className="text-xs text-text-sub dark:text-gray-400 mt-1">Upload files to see them here</p>
                  </div>
                )}
              </div>
            )}
          </FileUpload.Context>

          <FileUpload.HiddenInput />
        </FileUpload.Root>
      </div>
    </div>
  );
};