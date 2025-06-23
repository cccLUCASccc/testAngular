import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionService } from '../services/prediction.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LayoutComponent } from '../components/layout';
import { ReactiveFormsModule } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OnDestroy } from '@angular/core';
import { AlertButton } from '@ionic/core';

function stepValidator(step: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === '') {
      return null;
    }
    return Math.round((control.value * 1) / step) * step === control.value
      ? null
      : { step: { step } };
  };
}

// Classe supplémentaire pour gérer le style des ion-alert
interface AlertTitles {
  header?: string;
  // subHeader: string;
  buttons: AlertButton[];
  cssClass?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
    CommonModule,
    LayoutComponent,
    TranslateModule,
  ],
  templateUrl: './home.page.html',
})
export class HomePage implements OnDestroy {
  form: FormGroup;
  formResult: FormGroup;
  isSubmitting = false;
  isSending = false;
  isCleaning = false;
  submitButtonText = this.translate.instant('SUBMIT');
  sendButtonText = this.translate.instant('SEND');
  showResults = false;
  errorMessage: string | null = null;
  showResultsDetails = false;
  isMobile = false;
  showReportingDetails = false;
  showSuccessMessage = false;
  predictionSummary: any;
  predictionDetails: any[] = [];
  private translationSub: any;
  alertOptions: Record<string, AlertTitles> = {};

  availableTitles(): Record<string, AlertTitles> {
    return {
      sexe: {
        header: this.translate.instant('SEX_ALERT_TITLE'),
        // subHeader: 'Choix des sexes disponibles',
        buttons: [
          { text: this.translate.instant('CANCEL'), role: 'cancel' },
          { text: this.translate.instant('OK'), role: 'confirm' },
        ],
      },
      fr: {
        header: this.translate.instant('RISKS_ALERT_TITLE'),
        // subHeader: 'Choix des risques disponibles',
        buttons: [
          { text: this.translate.instant('CANCEL'), role: 'cancel' },
          { text: this.translate.instant('OK'), role: 'confirm' },
        ],
      },
      symp: {
        header: this.translate.instant('SYMPTOMS_ALERT_TITLE'),
        // subHeader: 'Choix des symptômes disponibles',
        buttons: [
          { text: this.translate.instant('CANCEL'), role: 'cancel' },
          { text: this.translate.instant('OK'), role: 'confirm' },
        ],
      },
      country: {
        header: this.translate.instant('COUNTRY_ALERT_TITLE'),
        //subHeader: 'Choix des pays disponibles',
        buttons: [
          { text: this.translate.instant('CANCEL'), role: 'cancel' },
          { text: this.translate.instant('OK'), role: 'confirm' },
        ],
      },
    };
  }

  getAlertOptions(context: string): AlertTitles {
    return {
      cssClass: 'custom-alert',
      ...this.availableTitles()[context],
    };
  }

  getMultiAlertOptions(context: string): AlertTitles {
    return {
      cssClass: 'custom-multi-alert',
      ...this.availableTitles()[context],
    };
  }

  getFormattedProbability(decimal: number): string {
    if (decimal === null || isNaN(decimal)) return 'N/A';
    const percentage = Math.round(decimal * 100);
    return `${percentage}%`;
  }

  //Vide les formulaires
  clearForm() {
    this.showResults = false;
    this.form.reset();
    this.formResult.reset();
  }

  convertNumber(event: any, controlName: string) {
    const value = parseFloat(event.target.value);
    this.form.get(controlName)?.setValue(isNaN(value) ? null : value);
  }

  filterNumbers(event: any) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Remplace tout ce qui n'est pas chiffre
    input.value = value.replace(/[^0-9]/g, '');

    // Met à jour la valeur dans le formControl
    this.formResult.get('providerNumber')?.setValue(input.value);

    // Déclenche la validation
    this.formResult.get('providerNumber')?.updateValueAndValidity();
  }

  contactMedicalTeam() {
    //Il faudrait implémenter l'action réelle

    if (this.formResult.valid && !this.isSubmitting) {
      this.isSending = true;
      this.isCleaning = true;
      this.sendButtonText = this.translate.instant('SENDING');
      this.showSuccessMessage = false;

      setTimeout(() => {
        console.log('Message transmis avec succès (simulation)');
        this.isSending = false;
        this.isCleaning = false;
        this.sendButtonText = this.translate.instant('SEND');

        //Afficher le message de confirmation d'envoi
        this.showSuccessMessage = true;

        //Réinitialisation du formulaire
        this.formResult.reset();

        //Masquer le message au bout de 1 secondes
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      }, 1000);
    } else {
      this.formResult.markAllAsTouched();
    }
  }

  //Affichage du détail des résultats
  toggleDetails(event: Event) {
    event.preventDefault(); // pour empêcher le scroll haut dû au href="#"
    this.showResultsDetails = !this.showResultsDetails;
  }

  //Affichage du reporting du médecin
  toggleReporting(event: Event) {
    event.preventDefault();
    this.showReportingDetails = !this.showReportingDetails;
  }

  get showGlobalError(): boolean {
    return !!(
      this.form.invalid &&
      this.form.touched &&
      (this.form.get('age')?.hasError('required') ||
        this.form.get('sexe')?.hasError('required') ||
        this.form.get('fr')?.hasError('required') ||
        this.form.get('symp')?.hasError('required'))
    );
  }

  @ViewChild('resultsRef') resultsRef!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private predictionService: PredictionService,
    private breakpointObserver: BreakpointObserver,
    private translate: TranslateService
  ) {
    this.formResult = this.fb.group({
      providerNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]+$/), // Regex pour chiffres uniquement
        ],
      ],
    });

    this.form = this.fb.group({
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      sexe: ['', Validators.required],
      temperature: [
        '',
        [Validators.min(34), Validators.max(43), stepValidator(0.1)],
      ],
      oxygen: [
        '',
        [Validators.min(80), Validators.max(100), stepValidator(0.1)],
      ],
      fr: [[], Validators.required],
      symp: [[], Validators.required],
    });

    this.setTranslatedButtons();
    this.translationSub = this.translate.onLangChange.subscribe(() => {
      this.setTranslatedButtons();
    });
  }

  ngOnDestroy(): void {
    if (this.translationSub) {
      this.translationSub.unsubscribe();
    }
  }

  private setTranslatedButtons(): void {
    this.submitButtonText = this.translate.instant('SUBMIT');
    this.sendButtonText = this.translate.instant('SEND');
  }

  get requiredFieldsResultError(): string | null {
    if (!this.formResult.invalid || !this.formResult.touched) return null;
    const missingFields = this.formResult
      .get('providerNumber')
      ?.hasError('required');
    if (!missingFields) return null;
    return this.translate.instant('FORM_RESULTS_FILLING_ERRORS');
  }

  get requiredFieldsError(): String | null {
    if (!this.form.invalid || !this.form.touched) return null;

    const labels: Record<string, string> = {
      age: this.translate.instant('FORM_FILLING_AGE_ERRORS'),
      sexe: this.translate.instant('FORM_FILLING_SEX_ERRORS'),
      fr: this.translate.instant('FORM_FILLING_RISKS_ERRORS'),
      symp: this.translate.instant('FORM_FILLING_SYMPTOMS_ERRORS'),
    };

    const missingFields = Object.keys(labels).filter((field) =>
      this.form.get(field)?.hasError('required')
    );

    if (missingFields.length === 0) return null;

    const labelList = missingFields.map((f) => `${labels[f]}`);

    let message: string;

    if (labelList.length === 1) {
      message =
        this.translate.instant('FORM_FILLING_LEFT_PART_SINGLE') +
        labelList[0] +
        this.translate.instant('FORM_FILLING_RIGHT_PART_SINGLE');
    } else {
      const last = labelList.pop();
      message =
        this.translate.instant('FORM_FILLING_LEFT_PART') +
        labelList.join(', ') +
        this.translate.instant('FORM_FILLING_MIDDLE_PART') +
        last +
        this.translate.instant('FORM_FILLING_RIGHT_PART');
    }

    return message;
  }

  // Méthode pour afficher les erreurs à l'utilisateur
  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = null;
    }, 10000);
  }

  onSubmit() {
    this.errorMessage = null;
    if (this.form.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.isCleaning = true;
      this.submitButtonText = this.translate.instant('SUBMITTING');
      this.showResults = false;

      // Préparation des données au format FHIR
      const fhirData = this.createFhirPayLoad(this.form.value);

      console.log('Données envoyées:', fhirData);

      this.predictionService.predictHospitalization(fhirData).subscribe({
        next: (response: any) => {
          // Vérification robuste de la réponse
          if (!response || typeof response.success !== 'boolean') {
            this.showError('Réponse serveur invalide');
            this.resetSubmitState();
            return;
          }

          if (response.success === false) {
            const errorMessage =
              response.message || 'Une erreur inconnue est survenue';
            this.showError(errorMessage);
            this.resetSubmitState();
            return;
          }

          // Traitement de la réponse réussie
          console.log('Succès:', response);
          this.processApiResponse(response);
          this.resetSubmitState();
          this.showResults = true;

          // Scroll vers les résultats sur mobile
          this.scrollToResultsOnMobile();
        },
        error: (err: any) => {
          console.error('Erreur:', err);
          this.resetSubmitState();

          // Gestion améliorée des erreurs HTTP
          let errorMessage = 'Erreur réseau';
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.message) {
            errorMessage = err.message;
          } else if (err.status) {
            errorMessage =
              `Erreur ${err.status}` +
              (err.statusText ? `: ${err.statusText}` : '');
          }

          this.showError(errorMessage);
        },
      });
    } else {
      this.form.markAllAsTouched();
      console.warn('❌ Formulaire invalide', this.form.value);
    }
  }

  // Méthodes utilitaires extraites pour plus de clarté
  private resetSubmitState(): void {
    this.isSubmitting = false;
    this.isCleaning = false;
    this.submitButtonText = this.translate.instant('SUBMIT');
  }

  private scrollToResultsOnMobile(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        if (result.matches) {
          this.isMobile = true; //Permet de gérer le libellé des lignes du tableau
          setTimeout(() => {
            this.resultsRef?.nativeElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }, 100);
        }
      });
  }

  private createFhirPayLoad(formData: any): any[] {
    const now = new Date().toISOString();

    //Facteurs de risque (convertis en 0/1)
    const riskFactors = {
      fr_asthme: formData.fr.includes('asthme') ? 1 : 0,
      fr_bpco: formData.fr.includes('bpco') ? 1 : 0,
      fr_diabete: formData.fr.includes('diabete') ? 1 : 0,
      fr_maladie_cardiovasculaire: formData.fr.includes(
        'maladie_cardiovasculaire'
      )
        ? 1
        : 0,
      fr_neoplasie: formData.fr.includes('neoplasie') ? 1 : 0,
      fr_obese: formData.fr.includes('obese') ? 1 : 0,
    };

    //Symptômes (convertis en 0/1)
    const symptoms = {
      symp_cephalees: formData.symp.includes('cephalees') ? 1 : 0,
      symp_digestifs: formData.symp.includes('digestifs') ? 1 : 0,
      symp_dyspnee: formData.symp.includes('dyspnee') ? 1 : 0,
      symp_fievre: formData.symp.includes('fievre') ? 1 : 0,
      symp_myalgies: formData.symp.includes('myalgies') ? 1 : 0,
      symp_toux: formData.symp.includes('toux') ? 1 : 0,
    };

    //Création du payload Fhir
    return [
      {
        subject: {
          reference: 'patient-id', //Remplacer par l'ID réel du patient
          display: 'nom et prénom du patient', //Facultatif
        },
        issued: now,
        component: [
          //Age
          {
            valueQuantity: {
              value: Number(formData.age),
            },
            code: {
              coding: [
                {
                  code: 'age',
                  display: 'Age',
                  system: 'http://comunicare.io',
                },
              ],
            },
          },
          //Sexe
          {
            valueQuantity: {
              value: Number(formData.sexe),
            },
            code: {
              coding: [
                {
                  code: 'sexe',
                  display: 'Sexe',
                  system: 'http://comunicare.io',
                },
              ],
            },
          },
          //Facteurs de risque
          ...Object.entries(riskFactors).map(([code, value]) => ({
            valueQuantity: {
              value: value,
            },
            code: {
              coding: [
                {
                  code: code,
                  display: code.replace('fr_', '').replace('_', ' '),
                  system: 'http://comunicare.io',
                },
              ],
            },
          })),
          //Symptômes
          ...Object.entries(symptoms).map(([code, value]) => ({
            valueQuantity: {
              value: value,
            },
            code: {
              coding: [
                {
                  code: code,
                  display: code.replace('symp_', ''),
                  system: 'http://comunicare.io',
                },
              ],
            },
          })),
          //Température (si fournie)
          ...(formData.temperature
            ? [
                {
                  valueQuantity: {
                    value: Number(formData.temperature),
                  },
                  code: {
                    coding: [
                      {
                        code: 'temperature',
                        display: 'Température',
                        system: 'http://comunicare.io',
                      },
                    ],
                  },
                },
              ]
            : []),
          //Oxygène (si fournie)
          ...(formData.oxygen
            ? [
                {
                  valueQuantity: {
                    value: Number(formData.oxygen),
                  },
                  code: {
                    coding: [
                      {
                        code: 'oxygen',
                        display: 'Oxygène',
                        system: 'http://comunicare.io',
                      },
                    ],
                  },
                },
              ]
            : []),
        ],
      },
    ];
  }

  private processApiResponse(response: any) {
    if (response.success && response.data?.length > 0) {
      const predictionData = response.data[0].prediction;

      //Récupération du résumé
      this.predictionSummary = predictionData.find(
        (p: any) => p.rationale === 'summary'
      );

      //Organisation des détails par méthode
      this.predictionDetails = [
        {
          methodLong: this.translate.instant('RF_LONG'),
          methodShort: this.translate.instant('RF_SHORT'),
          ambulatory: this.getProbability(predictionData, 'RF', 'ambulatoire'),
          hospitalization: this.getProbability(
            predictionData,
            'RF',
            'hospitalise'
          ),
        },
        {
          methodLong: this.translate.instant('NN_LONG'),
          methodShort: this.translate.instant('NN_SHORT'),
          ambulatory: this.getProbability(predictionData, 'NN', 'ambulatoire'),
          hospitalization: this.getProbability(
            predictionData,
            'NN',
            'hospitalise'
          ),
        },
        {
          methodLong: this.translate.instant('GBT_LONG'),
          methodShort: this.translate.instant('GBT_SHORT'),
          ambulatory: this.getProbability(predictionData, 'GBT', 'ambulatoire'),
          hospitalization: this.getProbability(
            predictionData,
            'GBT',
            'hospitalise'
          ),
        },
      ];
    }
  }

  private getProbability(
    data: any[],
    rationale: string,
    outcome: string
  ): number {
    const prediction = data.find(
      (p: any) =>
        p.rationale === rationale && p.outcome?.coding?.[0]?.code === outcome
    );
    return prediction?.probabilityDecimal || 0;
  }
}
