import { useState } from "react";
import { CreateCargo } from "../../../features/create-cargo-form";
import { CargosList } from "@/features/cargos-list";
import { SelectDestination } from "@/features/select-destination";
import ApplicationFormButtons from "@/features/application-form-buttons/ui/ApplicationFormButtons";

import "./ApplicationForm.scss";

interface ApplicationFormProps {
  type: "edit" | "create";
}

const ApplicationForm = (props: ApplicationFormProps) => {
  const {
    type,
  } = props;

  const [destination, setDestinaion] = useState('');

  const onSubmit = (event: any) => {
    event.preventDefault();
  }

  return (
    <form className="create-application-form section-background" onSubmit={onSubmit}>
      <section className="create-application-form__info">
        <CreateCargo />
        <SelectDestination
          destination={destination}
          setDestination={setDestinaion}
        />
        <ApplicationFormButtons type={type} />
      </section>
      <section className="create-application-form__cargos-list">
        <CargosList />
      </section>
    </form>
  )
}

export default ApplicationForm;