// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {ApolicePolicy} from "../ApolicePolicy.sol";
contract AtacanteReentrancia {
    ApolicePolicy public apolice;
    uint256 public vezesRecebido;
    bool public reentradaFalhou;
    bytes public ultimoErro;
    uint256 private periodoAtaque;
    function configurar(address alvo) external {
        apolice = ApolicePolicy(payable(alvo));
    }
    function atacar(uint256 periodo, uint32 indiceClimatico) external {
        periodoAtaque = periodo + 1;
        apolice.publicarIndices(periodo, indiceClimatico, keccak256("leituras-ataque"));
    }
    receive() external payable {
        vezesRecebido++;
        try apolice.publicarIndices(periodoAtaque, type(uint32).max, keccak256("reentrada")) {
            reentradaFalhou = false;
        } catch (bytes memory erro) {
            reentradaFalhou = true;
            ultimoErro = erro;
        }
    }
}
