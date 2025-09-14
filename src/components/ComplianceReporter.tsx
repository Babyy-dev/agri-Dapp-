import React, { useState } from 'react';
import { Shield, FileText, Download, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { AnalyticsService } from '../services/AnalyticsService';
import { AnimatedCard } from './AnimatedCard';
import { LoadingSpinner } from './LoadingSpinner';

export function ComplianceReporter() {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const availableBatches = [
    'ASH-2024-001',
    'ASH-2024-002',
    'TUR-2024-001',
    'BRA-2024-001'
  ];

  const generateReport = async () => {
    if (!selectedBatch) return;
    
    setIsLoading(true);
    try {
      const reportData = await AnalyticsService.generateComplianceReport(selectedBatch);
      setReport(reportData);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    // In real implementation, generate PDF
    const reportData = {
      batchId: selectedBatch,
      generatedAt: new Date().toISOString(),
      ...report
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${selectedBatch}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'fail': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <AnimatedCard className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <span>Compliance Reporter</span>
        </h3>

        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Batch for Compliance Report
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a batch...</option>
                {availableBatches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={generateReport}
                disabled={!selectedBatch || isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {report && (
        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-800">
              Compliance Report - {selectedBatch}
            </h4>
            <button
              onClick={downloadReport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>

          {/* Overall Score */}
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">{report.overallScore}%</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Overall Compliance Score</h3>
              <p className="text-gray-600">
                {report.overallScore >= 90 ? 'Excellent compliance' :
                 report.overallScore >= 80 ? 'Good compliance' :
                 report.overallScore >= 70 ? 'Acceptable compliance' : 'Needs improvement'}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-4">
            <h5 className="font-semibold text-gray-800">Compliance Categories</h5>
            {report.categories.map((category: any, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getStatusColor(category.status)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(category.status)}
                    <h6 className="font-medium text-gray-800">{category.name}</h6>
                  </div>
                  <span className="font-bold text-gray-800">{category.score}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      category.status === 'pass' ? 'bg-green-600' :
                      category.status === 'warning' ? 'bg-amber-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${category.score}%` }}
                  ></div>
                </div>

                <div className="space-y-1">
                  {category.details.map((detail: string, i: number) => (
                    <p key={i} className="text-sm text-gray-600">• {detail}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Report Footer */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Report generated: {new Date().toLocaleString()}</span>
              <span>Valid for regulatory submission</span>
            </div>
          </div>
        </AnimatedCard>
      )}
    </div>
  );
}