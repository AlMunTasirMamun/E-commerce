import { useNavigate } from 'react-router-dom';

const Career = () => {
  const navigate = useNavigate();

  const jobs = [
    {
      id: 1,
      title: "Full Stack Developer",
      department: "Engineering",
      location: "Dhaka, Bangladesh",
      type: "Full-time"
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      location: "Dhaka, Bangladesh",
      type: "Full-time"
    },
    {
      id: 3,
      title: "Marketing Specialist",
      department: "Marketing",
      location: "Remote",
      type: "Full-time"
    },
    {
      id: 4,
      title: "Customer Support Executive",
      department: "Support",
      location: "Dhaka, Bangladesh",
      type: "Full-time"
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Join Our Team
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're looking for talented individuals to help us revolutionize the e-commerce industry
          </p>
        </div>

        {/* Why Join Us */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-indigo-600 mb-2">💼 Growth Opportunities</h3>
            <p className="text-gray-600">Grow your career with a dynamic and innovative team</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">🎯 Meaningful Work</h3>
            <p className="text-gray-600">Work on projects that make a real difference</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-purple-600 mb-2">🌟 Best Benefits</h3>
            <p className="text-gray-600">Competitive salary and comprehensive benefits package</p>
          </div>
        </div>

        {/* Job Listings */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h2>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.department}</p>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                    Apply Now
                  </button>
                </div>
                <div className="flex gap-6 text-sm text-gray-600">
                  <span>📍 {job.location}</span>
                  <span>⏰ {job.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Don't see a position that fits?</h3>
          <p className="mb-4">Send us your resume and let us know how you can contribute to our team</p>
          <button className="px-6 py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition">
            Send Resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default Career;
