pipeline {
    agent any

    tools {
        jdk 'jdk'
        nodejs 'nodejs'
    }

    environment {
        SONAR_SCANNER_HOME = tool 'sonar_scanner'
        SONAR_PROJECT_KEY = 'npm'
        SONAR_HOST = "http://localhost:9000/"
        DOCKERHUB_REPO = 'arbaazij/backend_jnks'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', credentialsId: 'Git-token', url: 'https://github.com/arbaaz29/npm.git'
            }
        }

        stage('SonarQube') {
            steps {
                dir('App-files/backend') {
                    withCredentials([string(credentialsId: 'sonarqube_token', variable: 'tkn')]) {
                        withSonarQubeEnv('SonarQube') {
                            sh """
                            ${SONAR_SCANNER_HOME}/bin/sonar-scanner \
                            -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=${SONAR_HOST} \
                            -Dsonar.login=${tkn}
                            """
                        }
                    }
                }
            }
        }

        // stage('Quality Gate') {
        //     steps {
        //         withCredentials([string(credentialsId: 'sonarqube_token', variable: 'tkn')]) {
        //             withSonarQubeEnv('SonarQube') {
        //                 script {
        //                     waitForQualityGate abortPipeline: false, credentialsId: 'sonarqube_token'
        //                 }
        //             }
        //         }
        //     }
        // }

        // stage('OWASP Dependency-Check Scan') {
        //     steps {
        //         dir('App-files/backend') {
        //             dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'DP-Check'
        //             dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
        //         }
        //     }
        // }

        stage('Trivy File Scan') {
            steps {
                dir('App-files/backend') {
                    sh 'trivy fs . > trivyfs.txt'
                }
            }
        }

        stage('Docker Image Build') {
            steps {
                script {
                    docker.build("${DOCKERHUB_REPO}:latest")
                }
            }
        }

        stage('Trivy Image Scan') {
            steps {
                sh 'trivy --severity HIGH,CRITICAL --no-progress --format table -o trivy-report.html image ${DOCKERHUB_REPO}:latest'
            }
        }

        // stage('Unit Test') {
        // }
    }
}
