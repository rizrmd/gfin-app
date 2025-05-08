import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocalSet } from "@/lib/hooks/use-local-set";
import type { ListDoctor } from "backend/src/api/queue/list-doctor";
import type { Poli } from "backend/api/queue/list-poli";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { user } from "@/lib/user";
import { useEffect } from "react";
import { chrono } from "shared/lib/chrono";
import { apiClient, apiResult } from "@/lib/api";

// API client setup
const api_patient = apiClient({
  url: "api/patient/create-queue-new-patient",
  sampleData: ({
    name,
    nik,
    birth_date,
    birth_place,
    gender,
    address,
    phone_number,
    bpjs_number,
    ihs_number,
    id_client,

    id_poli,
    id_doctor,
    channel_name,
    blood_pressure,
    body_height,
    body_weight,
    registered_date,
  }: {
    name: string;
    nik: number;
    birth_date: Date;
    birth_place?: string;
    gender: string;
    address?: string;
    phone_number?: number;
    bpjs_number?: number;
    ihs_number?: string;
    id_client: string;
    id_poli?: string;
    id_doctor?: string;
    channel_name?: string;
    blood_pressure?: string;
    body_height?: string;
    body_weight?: string;
    registered_date?: Date;
  }) => {
    return {
      id: "sample-id",
      name,
      nik,
      birth_date,
      birth_place,
      gender,
      address,
      phone_number,
      id_client,
      bpjs_number,
      ihs_number,
      created_date: chrono.now(),
    };
  },
});

const api_poli = apiClient({
  url: "api/queue/list-poli",
  sampleData: () => [
    {
      id: "8cfce5c7-0434-4fd3-9302-a9febb309729",
      name: "Poli Umum",
    },
    ,
  ],
});

const api_doctor = apiClient({
  url: "api/queue/list-doctor/",
  sampleData: (id_poli: string) => [
    {
      id: "123",
      name: "Dr. John Doe",
    },
  ],
});

const lang = {
  title: "Tambah Pasien",
  menu: "Daftar Pasien",
  name: "Nama Lengkap",
  nik: "NIK",
  birth_date: "Tanggal Lahir",
  birth_place: "Tempat Lahir",
  gender: "Jenis Kelamin",
  address: "Alamat",
  phone_number: "Nomor Telepon",
  bpjs_number: "Nomor BPJS",
  ihs_number: "Nomor IHS",

  doctor: "Dokter",
  select_doctor: "Pilih Dokter",
  channel_name: "Channel",
  blood_pressure: "Tekanan Darah",
  body_height: "Tinggi Badan",
  body_weight: "Berat Badan",
  poli: "Poli",

  submit: "Tambah",
  error_required: "Wajib diisi",
  error_invalid_nik: "NIK harus 16 digit",
  error_invalid_phone: "Format nomor telepon tidak valid",
  error_invalid_bpjs: "Nomor BPJS harus 13 digit",
  error_server: "Terjadi kesalahan pada server",
  success: "Data berhasil disimpan",
};

interface PopupAddPasienProps {
  show_popup: boolean;
  onClose?: () => void;
  getNewQueue?: () => void;
}

export default function PopupAddPasien({
  show_popup,
  onClose,
  getNewQueue,
}: PopupAddPasienProps) {
  const local = useLocalSet(() => ({
    form: {
      name: "",
      nik: "",
      birth_date: null as string | null,
      birth_place: "",
      gender: "L",
      address: "",
      phone_number: "",
      bpjs_number: "",
      ihs_number: "",
      id_client: user.id_client,

      id_poli: "",
      id_doctor: "",
      channel_name: "",
      blood_pressure: "",
      body_height: "",
      body_weight: "",
      registered_date: chrono.now(),
    },
    errors: {} as Record<string, string>,
    poli: apiResult(api_poli),
    doctors: apiResult(api_doctor),
    create: apiResult(api_patient, {
      onResult(result) {
        
        if (result.error) {
          local.set((p) => {
            p.errors.submit = result.error;
          });
          return;
        }

        if (result.status === "done") {
          if (onClose) {
            onClose();
          }

          if (getNewQueue) {
            getNewQueue();
          }
        }
      },
    }),
  }));

  useEffect(() => {
    local.poli.call();
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Required field validations
    if (!local.form.name) errors.name = lang.error_required;
    if (!local.form.nik) errors.nik = lang.error_required;
    if (!local.form.birth_date) errors.birth_date = lang.error_required;
    if (!local.form.gender) errors.gender = lang.error_required;
    if (!local.form.phone_number) errors.phone_number = lang.error_required;

    // Format validations
    if (local.form.nik && local.form.nik.length !== 16)
      errors.nik = lang.error_invalid_nik;
    if (
      local.form.phone_number &&
      !/^\d{10,12}$/.test(local.form.phone_number)
    ) {
      errors.phone_number = lang.error_invalid_phone;
    }

    if (local.form.bpjs_number && local.form.bpjs_number.length !== 13) {
      errors.bpjs_number = lang.error_invalid_bpjs;
    }

    if (local.form.id_poli !== "") {
      if (!local.form.id_doctor) errors.id_doctor = lang.error_required;
      if (!local.form.channel_name) errors.channel_name = lang.error_required;
    }

    local.set((p) => {
      p.errors = errors;
    });

    return Object.keys(errors).length === 0;
  };

  return (
    <>
      {local.create.status === "loading" ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            
            if (!validateForm()) return;

            local.create.call({
              name: local.form.name,
              nik: parseInt(local.form.nik),
              birth_date: local.form.birth_date
                ? new Date(local.form.birth_date)
                : new Date(),
              birth_place: local.form.birth_place,
              gender: local.form.gender,
              address: local.form.address,
              phone_number: local.form.phone_number
                ? parseInt(local.form.phone_number)
                : undefined,
              bpjs_number: local.form.bpjs_number
                ? parseInt(local.form.bpjs_number)
                : undefined,
              id_client: user.id_client,

              id_poli: local.form.id_poli,
              id_doctor: local.form.id_doctor,
              channel_name: local.form.channel_name,
              blood_pressure: local.form.blood_pressure,
              body_height: local.form.body_height,
              body_weight: local.form.body_weight,
              registered_date: local.form.registered_date,
            });
          }}
          className="grid grid-cols-2 gap-4 w-full"
        >
          <div className="col-span-1">
            <Label htmlFor="name">{lang.name}</Label>
            <Input
              id="name"
              value={local.form.name}
              onChange={(e) => {
                local.set((p) => {
                  p.form.name = e.target.value;
                });

                local.set((p) => {
                  p.errors = {}; // Clear error on change
                });
              }}
              error={local.errors.name}
            />
          </div>

          <div>
            <Label htmlFor="nik">{lang.nik}</Label>
            <Input
              id="nik"
              value={local.form.nik}
              onChange={(e) => {
                local.set((p) => {
                  p.form.nik = e.target.value.replace(/\D/g, "").slice(0, 16);
                });

                local.set((p) => {
                  p.errors = {}; // Clear error on change
                });
              }}
              error={local.errors.nik}
            />
          </div>

          <div>
            <Label htmlFor="birth_date">{lang.birth_date}</Label>
            <Input
              id="birth_date"
              value={local.form.birth_date || ""}
              type="date"
              error={local.errors.birth_date}
              onChange={(e) => {
                local.set((p) => {
                  p.form.birth_date = e.target.value || null;
                });
              }}
            />
          </div>

          <div>
            <Label htmlFor="birth_place">{lang.birth_place}</Label>
            <Input
              id="birth_place"
              value={local.form.birth_place}
              onChange={(e) => {
                local.set((p) => {
                  p.form.birth_place = e.target.value;
                });
              }}
            />
          </div>

          <div>
            <Label htmlFor="gender">{lang.gender}</Label>
            <select
              id="gender"
              className="w-full border rounded-md p-2"
              value={local.form.gender}
              onChange={(e) => {
                local.set((p) => {
                  p.form.gender = e.target.value;
                });
              }}
            >
              <option value="Laki-Laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div>
            <Label htmlFor="address">{lang.address}</Label>
            <Input
              id="address"
              value={local.form.address}
              onChange={(e) => {
                local.set((p) => {
                  p.form.address = e.target.value;
                });

                local.set((p) => {
                  p.errors = {}; // Clear error on change
                });
              }}
            />
          </div>

          <div>
            <Label htmlFor="phone_number">{lang.phone_number}</Label>
            <Input
              id="phone_number"
              value={local.form.phone_number}
              onChange={(e) => {
                local.set((p) => {
                  p.form.phone_number = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 12);
                });

                local.set((p) => {
                  p.errors = {}; // Clear error on change
                });
              }}
              error={local.errors.phone_number}
            />
          </div>

          <div>
            <Label htmlFor="bpjs_number" error={local.errors.bpjs_number}>
              {lang.bpjs_number}
            </Label>
            <Input
              id="bpjs_number"
              value={local.form.bpjs_number}
              onChange={(e) => {
                local.set((p) => {
                  p.form.bpjs_number = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 13);
                });
              }}
              error={local.errors.bpjs_number}
            />
          </div>

          <div>
            <Label htmlFor="ihs_number">{lang.ihs_number}</Label>
            <Input
              id="ihs_number"
              value={local.form.ihs_number}
              onChange={(e) => {
                local.set((p) => {
                  p.form.ihs_number = e.target.value;
                });
              }}
            />
          </div>

          <div>
            <div>
              <Label htmlFor="id_poli">Poli</Label>
            </div>
            {local.poli.status === "loading" ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={local.form.id_poli}
                onValueChange={async (value) => {
                  if (value === "null") {
                    local.set((p) => {
                      p.form.id_poli = "";
                    });
                    return;
                  }

                  await local.doctors.call(value);

                  local.set((p) => {
                    p.form.id_poli = value;
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={"Pilih Poli"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Pilih Poli</SelectItem>
                  {local.poli.data?.map((item: Poli) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {local.errors.id_poli && (
              <p className="text-sm text-red-500 mt-1">
                {local.errors.id_poli}
              </p>
            )}
          </div>

          {local.form.id_poli &&
            local.form.id_poli !== "" &&
            local.doctors.data.length > 0 && (
              <>
                <div>
                  <div>
                    <Label htmlFor="doctor">{lang.doctor}</Label>
                  </div>
                  {local.doctors.status === "loading" ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={local.form.id_doctor}
                      onValueChange={(value) => {
                        local.set((p) => {
                          p.form.id_doctor = value;
                        });

                        local.set((p) => {
                          p.errors = {}; // Clear error on change
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={lang.select_doctor} />
                      </SelectTrigger>
                      <SelectContent>
                        {local.doctors.data?.map((doctor: ListDoctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {local.errors.id_doctor && (
                    <p className="text-sm text-red-500 mt-1">
                      {local.errors.id_doctor}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="channel_name">{lang.channel_name}</Label>
                  <Select
                    value={local.form.channel_name}
                    onValueChange={(value) => {
                      local.set((p) => {
                        p.form.channel_name = value;
                      });

                      local.set((p) => {
                        p.errors = {}; // Clear error on change
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walk in">Walk In</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="blood_pressure">{lang.blood_pressure}</Label>
                  <Input
                    id="blood_pressure"
                    value={local.form.blood_pressure}
                    onChange={(e) => {
                      local.set((p) => {
                        p.form.blood_pressure = e.target.value;
                      });
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="body_height">{lang.body_height}</Label>
                  <Input
                    id="body_height"
                    value={local.form.body_height}
                    onChange={(e) => {
                      local.set((p) => {
                        p.form.body_height = e.target.value;
                      });
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="body_weight">{lang.body_weight}</Label>
                  <Input
                    id="body_weight"
                    value={local.form.body_weight}
                    onChange={(e) => {
                      local.set((p) => {
                        p.form.body_weight = e.target.value;
                      });
                    }}
                  />
                </div>
              </>
            )}

          {local.errors.submit && (
            <div className="col-span-2 text-red-500 text-sm">
              {local.errors.submit}
            </div>
          )}

          <div className="col-span-2">
            <Button type="submit">{lang.submit}</Button>
          </div>
        </form>
      )}
    </>
  );
}
