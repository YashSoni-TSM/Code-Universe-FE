// src/pages/SelectionScreen.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { getStackOptions, generateProject, type AllStackOptions, type StackOption } from "../services/apiService";

const dropdownVariants: Variants = {
  hidden: { opacity: 0, scaleY: 0, originY: 0 },
  visible: { opacity: 1, scaleY: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scaleY: 0, transition: { duration: 0.15 } }
};

function SelectionScreen() {
  const [allOptions, setAllOptions] = useState<AllStackOptions | null>(null);
  const [projectName, setProjectName] = useState("My-CodeUniverse-Project");
  const [frontend, setFrontend] = useState<StackOption | null>(null);
  const [backend, setBackend] = useState<StackOption | null>(null);
  const [module, setModule] = useState<StackOption | null>(null);
  const [openDropdown, setOpenDropdown] = useState<'frontend' | 'backend' | 'module' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch options from API
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const options = await getStackOptions();
        setAllOptions(options);
      } catch (err) {
        console.error(err);
        setError("Failed to load options from server.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const toggleDropdown = (type: 'frontend' | 'backend' | 'module') => {
    setOpenDropdown(openDropdown === type ? null : type);
  };

  const handleSelect = (type: 'frontend' | 'backend' | 'module', option: StackOption) => {
    if (type === "frontend") setFrontend(option);
    if (type === "backend") setBackend(option);
    if (type === "module") setModule(option);
    setOpenDropdown(null);
    setError(null);
  };

  const handleGenerateClick = async () => {
    if (!frontend || !backend || !projectName) {
      setError("Project Name, Frontend, and Backend are required.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccessMessage(null);

    const payload = {
      project_name: projectName,
      frontend: frontend.label,
      backend: backend.label,
      modules: module ? [module.label] : [],
    };

    try {
      await generateProject(payload);
      setSuccessMessage("Project generated and download started successfully!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setError("Failed to generate project.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isNextDisabled = !frontend || !backend || !projectName || isGenerating || isLoading;

  const renderDropdown = (type: 'frontend' | 'backend' | 'module', selectedValue: StackOption | null) => {
    const options = allOptions?.[type] || [];
    const isOpen = openDropdown === type;

    return (
      <div className="relative w-full">
        <motion.div
          className="w-full p-4 bg-slate-700/50 rounded-lg text-white border border-slate-600 cursor-pointer flex items-center justify-between"
          onClick={() => toggleDropdown(type)}
          whileHover={{ scale: 1.02 }}
        >
          <span className={selectedValue ? "text-white" : "text-gray-400"}>
            {selectedValue ? selectedValue.value : `Select ${type}...`}
          </span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute z-20 w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl overflow-hidden"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="max-h-60 overflow-y-auto">
                {options.map(option => (
                  <motion.div
                    key={option.label}
                    className="p-3 cursor-pointer hover:bg-purple-500 transition-colors duration-200 text-white"
                    onClick={() => handleSelect(type, option)}
                    whileHover={{ x: 5 }}
                  >
                    {option.value}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-white p-4 bg-gradient-to-r from-[#1e3c72] via-[#2a5298] to-[#1e3c72] animate-[gradientMove_12s_ease_infinite]">
      <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">CodeUniverse</h1>
      <p className="text-lg md:text-xl text-gray-200 mb-8">Craft your universe. Generate your stack.</p>

      <div className="w-full max-w-lg mb-4">
        <label htmlFor="projectName" className="block text-lg font-semibold text-gray-200 mb-2">Project Name</label>
        <input
          id="projectName"
          type="text"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          className="w-full p-3 bg-slate-700/50 rounded-lg text-white border border-slate-600 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          placeholder="e.g., my-awesome-project"
        />
      </div>

      <div className="flex flex-col gap-6 w-full max-w-lg">
        <div>{renderDropdown('frontend', frontend)}</div>
        <div>{renderDropdown('backend', backend)}</div>
        <div>{renderDropdown('module', module)}</div>
      </div>

      {error && <div className="mt-6 text-red-400 bg-red-900/50 p-4 rounded-lg w-full max-w-lg text-center">{error}</div>}
      {successMessage && <div className="mt-6 text-green-400 bg-green-900/50 p-4 rounded-lg w-full max-w-lg text-center">{successMessage}</div>}

      <button
        className="mt-12 py-4 px-12 text-lg font-bold text-white rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isNextDisabled}
        onClick={handleGenerateClick}
      >
        {isGenerating ? "Generating..." : "Generate & Download"}
      </button>
    </div>
  );
}

export default SelectionScreen;
