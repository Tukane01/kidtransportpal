import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input"; // Assuming this is the input component you're using
import { Button } from "@/components/ui/button"; // Assuming you're using a Button component from your UI library

interface ProfileFormProps {
  profile: { name: string; surname: string; email: string; phone: string; idNumber: string };
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile }) => {
  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    idNumber: "",
  });

  // Sync form data with profile when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        surname: profile.surname || "",
        email: profile.email || "",
        phone: profile.phone || "",
        idNumber: profile.idNumber || "",
      });
    }
  }, [profile]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here, you can call an API or perform any action with the form data
    console.log("Form submitted with data:", formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name">Name</label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="mt-2"
        />
      </div>

      <div>
        <label htmlFor="surname">Surname</label>
        <Input
          id="surname"
          name="surname"
          value={formData.surname}
          onChange={handleInputChange}
          className="mt-2"
        />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="mt-2"
        />
      </div>

      <div>
        <label htmlFor="phone">Phone</label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="mt-2"
        />
      </div>

      <div>
        <label htmlFor="idNumber">ID Number</label>
        <Input
          id="idNumber"
          name="idNumber"
          value={formData.idNumber}
          onChange={handleInputChange}
          className="mt-2"
        />
      </div>

      <div className="mt-4">
        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
