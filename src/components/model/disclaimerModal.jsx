import React from "react";
const disclaimerText = `AzurE E-ship 电船系统模拟软件及附带的文档、说明和示例数据，由骏烨电船科技（上海）有限公司按"现状"提供。本软件旨在为电动船舶及混动系统的设计、分析和优化提供参考，但不对结果的准确性、完整性或满足特定需求作任何明示或暗示的保证。用户应结合自身专业知识和工程经验，对计算结果、仿真数据和经济性分析进行独立验证，不得将其作为唯一决策依据。因使用或无法使用本软件（包括数据输入错误、参数设置不当、系统兼容等）导致的任何直接、间接、附带或后果性损失，包括利润、业务或数据的损失，骏烨电船科技（上海）有限公司及其合作方不承担责任。使用本软件即视为接受本免责声明全部条款。\n\nThe AzurE E-ship Electric Vessel System Simulation Software, together with its documentation, instructions, and sample data, is provided by General Energies Electrical Ship(Shanghai) Limited on an "as-is" basis. It is intended as a reference for the design, analysis, and optimization of electric and hybrid vessel systems, without express or implied warranties regarding accuracy, completeness, or fitness for any particular purpose. Users must apply their own expertise to verify all parameters, simulation outputs, and economic analyses, and should not rely solely on the software for final decisions. General Energies Electrical Ship(Shanghai) Limited and its partners accept no liability for any direct, indirect, incidental, or consequential damages—including loss of profits, business, or data—arising from the use or inability to use the software, including but not limited to input errors, improper settings, or compatibility issues. Use of this software constitutes acceptance of all terms in this disclaimer.`;

const DisclaimerModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content disclaimer-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>AzurE E-ship 软件免责声明</h2>
          <button className="modal-close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="disclaimer-text">
            {disclaimerText.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
