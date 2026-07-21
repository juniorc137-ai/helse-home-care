import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { List } from "react-native-paper";
import { colors } from "../constants/theme";
import { useResponsive } from "../hooks/useResponsive";
import type { Patient } from "../types/entities";
import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";

interface PatientProfileViewProps {
  patient: Patient;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function IdentitySection({ patient }: { patient: Patient }) {
  return (
    <Card title="Identidade" style={styles.gridItem}>
      <Field label="Nome" value={patient.name} />
      <Field label="CPF" value={patient.cpf} />
      <Field label="Data de nascimento" value={patient.birthDate} />
      <Field label="Sexo" value={patient.sex} />
    </Card>
  );
}

function ClinicalSection({ patient }: { patient: Patient }) {
  return (
    <Card title="Clínico" style={styles.gridItem}>
      <Field label="Diagnóstico principal" value={patient.mainDiagnosis} />
      {patient.cid10 && <Field label="CID-10" value={patient.cid10} />}
      <Field label="Comorbidades" value={patient.comorbidities.join(", ") || "Nenhuma registrada"} />
      <Field label="Alergias" value={patient.allergies.join(", ") || "Nenhuma registrada"} />
      <Field label="Medicações ativas" value={patient.activeMedications.join(", ") || "Nenhuma registrada"} />
    </Card>
  );
}

function ContactSection({ patient }: { patient: Patient }) {
  return (
    <Card title="Contato e cuidador" style={styles.gridItem}>
      <Field
        label="Contato de emergência primário"
        value={`${patient.primaryEmergencyContact.name} (${patient.primaryEmergencyContact.relationship}) — ${patient.primaryEmergencyContact.phone}`}
      />
      {patient.secondaryEmergencyContact && (
        <Field
          label="Contato de emergência secundário"
          value={`${patient.secondaryEmergencyContact.name} (${patient.secondaryEmergencyContact.relationship}) — ${patient.secondaryEmergencyContact.phone}`}
        />
      )}
      <Field
        label="Responsável pelo cuidado"
        value={`${patient.responsibleCaregiver.name} — ${patient.responsibleCaregiver.relationship} (${patient.responsibleCaregiver.availability})`}
      />
      <View style={styles.consentRow}>
        <Text style={styles.fieldLabel}>Consentimento LGPD</Text>
        <StatusBadge label={patient.consent.consentGiven ? "Concedido" : "Não concedido"} tone={patient.consent.consentGiven ? "ok" : "danger"} />
      </View>
    </Card>
  );
}

/** Perfil do Paciente (seção 2.2): read-only por padrão; 3 colunas no desktop, acordeão no mobile. */
export function PatientProfileView({ patient }: PatientProfileViewProps) {
  const { isDesktop } = useResponsive();
  const [expandedId, setExpandedId] = useState<string>("identidade");

  if (isDesktop) {
    return (
      <View style={styles.desktopGrid}>
        <IdentitySection patient={patient} />
        <ClinicalSection patient={patient} />
        <ContactSection patient={patient} />
      </View>
    );
  }

  return (
    <List.AccordionGroup expandedId={expandedId} onAccordionPress={(id) => setExpandedId(String(id))}>
      <List.Accordion title="Identidade" id="identidade">
        <IdentitySection patient={patient} />
      </List.Accordion>
      <List.Accordion title="Clínico" id="clinico">
        <ClinicalSection patient={patient} />
      </List.Accordion>
      <List.Accordion title="Contato e cuidador" id="contato">
        <ContactSection patient={patient} />
      </List.Accordion>
    </List.AccordionGroup>
  );
}

const styles = StyleSheet.create({
  desktopGrid: { flexDirection: "row", gap: 12 },
  gridItem: { flex: 1 },
  field: { marginBottom: 6 },
  fieldLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: "600" },
  fieldValue: { fontSize: 14, color: colors.textPrimary },
  consentRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
});
