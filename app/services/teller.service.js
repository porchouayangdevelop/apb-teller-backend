import { tellerPool } from "../config/database.js";
var connection;
class tellerService {
  async getActiveTellers() {

    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
          SELECT 
          tlr as teller,
          tlr_br as branch,
          tlr_cn_nm as name,
          tlr_lvl as level,
          a.tlr_typ as type,
          dpt_no as department,
          CASE sign_sts
            WHEN 'O' THEN 'Online'
            WHEN 'T' THEN 'Temporary Logout'
            WHEN 'F' THEN 'Formal Logout'
            WHEN 'C' THEN 'Force Logout'
          END AS 'sign_status'
        FROM bpttlt a
        WHERE sign_sts IN ('O', 'T')
        ORDER BY tlr_br ASC
        `);
      return rows;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  async getTellerStats() {
    connection;
    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
          SELECT 
          CASE sign_sts
            WHEN 'O' THEN 'Online'
            WHEN 'T' THEN 'Temporary Logout'
            WHEN 'F' THEN 'Formal Logout'
            WHEN 'C' THEN 'Force Logout'
          END AS status,
          COUNT(*) as count
        FROM bpttlt
        GROUP BY sign_sts
        ORDER BY 
          CASE sign_sts
            WHEN 'O' THEN 1
            WHEN 'T' THEN 2
            WHEN 'F' THEN 3
            WHEN 'C' THEN 4
          END
          `);
      return rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
    finally {
      if (connection) connection.release();
    }
  }

  async getTellerStatsByBranch() {
    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
        SELECT 
          tlr_br as branch,
          SUM(IF(sign_sts = 'O', 1, 0)) as online,
          SUM(IF(sign_sts = 'T', 1, 0)) as temp_logout
        FROM bpttlt
        WHERE sign_sts IN ('O', 'T')
        GROUP BY tlr_br
        ORDER BY tlr_br ASC;
        `);
      return rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
    finally {
      if (connection) connection.release();
    }
  }

  async getDashboardStats() {
    try {
      const tellers = this.getActiveTellers();
      const stats = this.getTellerStats();
      const branchStats = this.getTellerStatsByBranch();
      return {
        tellers,
        stats,
        branchStats
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTellerById(tellerId) {
    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
        SELECT 
          tlr as teller,
          tlr_br as branch,
          tlr_cn_nm as name,
          tlr_lvl as level,
          a.tlr_typ as type,
          dpt_no as department,
          CASE sign_sts
            WHEN 'O' THEN 'Online'
            WHEN 'T' THEN 'Temporary Logout'
            WHEN 'F' THEN 'Formal Logout'
            WHEN 'C' THEN 'Force Logout'
          END AS 'sign_status'
        FROM bpttlt a
        WHERE tlr = ?
        `, [tellerId]);
      return rows;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  async getTellerByBranchId(branchId) {
    try {
      connection = await tellerPool.getConnection();
      const [rows] = await connection.execute(`
        SELECT 
          tlr as teller,
          tlr_br as branch,
          tlr_cn_nm as name,
          tlr_lvl as level,
          a.tlr_typ as type,
          dpt_no as department,
          CASE sign_sts
            WHEN 'O' THEN 'Online'
            WHEN 'T' THEN 'Temporary Logout'
            WHEN 'F' THEN 'Formal Logout'
            WHEN 'C' THEN 'Force Logout'
          END AS 'sign_status'
        FROM bpttlt a
        WHERE tlr_br = ? AND sign_sts IN ('O', 'T')
        ORDER BY tlr ASC
        `, [branchId]);
      return rows;
    } catch (error) {
      console.error(error);
      throw error;
    }
    finally {
      if (connection) connection.release();
    }
  }

}


export default new tellerService();