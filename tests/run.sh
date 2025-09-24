#!/bin/bash

# Executa todos os arquivos .spec.ts individualmente e exibe o resultado de cada um

TEST_FILES=$(find ./tests -type f -name "*.spec.ts")
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

EXIT_CODE=0
clear;
clear;
for file in $TEST_FILES; do
    START=$(date +%s)
    echo "==============================="
    echo -e "Rodando teste: ${BLUE}$file${NC}"
    echo "==============================="
    yarn vitest run $file --environment=node --globals
    END=$(date +%s)
    echo -e "${RED}########### Duração: $((END - START)) segundos - Teste: $file${NC}"
    CODE=$?
    if [ $CODE -ne 0 ]; then
        EXIT_CODE=$CODE
    fi
done

exit $EXIT_CODE
